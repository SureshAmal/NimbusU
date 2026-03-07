import yaml
import sys
import json
from collections import defaultdict

def resolve_ref(ref, spec):
    parts = ref.split('/')[1:]
    current = spec
    for part in parts:
        current = current.get(part, {})
    return current

def get_schema_fields(schema, spec):
    if '$ref' in schema:
        schema = resolve_ref(schema['$ref'], spec)
    
    if 'allOf' in schema:
        fields = {}
        for s in schema['allOf']:
            fields.update(get_schema_fields(s, spec))
        return fields
        
    if schema.get('type') == 'array':
        return get_schema_fields(schema.get('items', {}), spec)
    
    properties = schema.get('properties', {})
    required = schema.get('required', [])
    
    fields = {}
    for name, prop in properties.items():
        prop_type = prop.get('type', 'string')
        if '$ref' in prop:
            prop_type = prop['$ref'].split('/')[-1]
        elif prop.get('type') == 'array':
            items = prop.get('items', {})
            if '$ref' in items:
                prop_type = f"Array of {items['$ref'].split('/')[-1]}"
            else:
                prop_type = f"Array of {items.get('type', 'string')}"
        
        description = prop.get('description', '')
        if prop.get('readOnly'):
            description += ' (read-only)'
        if prop.get('writeOnly'):
            description += ' (write-only)'
            
        fields[name] = {
            'type': prop_type,
            'required': name in required,
            'description': description
        }
    return fields

def generate_example(schema, spec):
    if '$ref' in schema:
        return generate_example(resolve_ref(schema['$ref'], spec), spec)
    
    if 'allOf' in schema:
        example = {}
        for s in schema['allOf']:
            if isinstance(s, dict):
                res = generate_example(s, spec)
                if isinstance(res, dict):
                    example.update(res)
        return example
        
    type_ = schema.get('type')
    if type_ == 'object' or 'properties' in schema:
        example = {}
        for name, prop in schema.get('properties', {}).items():
            example[name] = generate_example(prop, spec)
        return example
    
    if type_ == 'array':
        return [generate_example(schema.get('items', {}), spec)]
        
    if type_ == 'string':
        if schema.get('format') == 'uuid':
            return "123e4567-e89b-12d3-a456-426614174000"
        elif schema.get('format') == 'date-time':
            return "2023-10-23T12:00:00Z"
        elif schema.get('format') == 'date':
            return "2023-10-23"
        elif schema.get('format') == 'email':
            return "user@example.com"
        elif schema.get('format') == 'uri':
            return "https://example.com/resource"
        if schema.get('enum'):
            return schema.get('enum')[0]
        return "string"
    
    if type_ == 'integer':
        return 0
        
    if type_ == 'number':
        return 0.0
        
    if type_ == 'boolean':
        return True
        
    return None

def markdown_for_fields(fields, title):
    if not fields:
        return ""
    
    md = f"#### {title}\n\n"
    md += "| Field | Type | Required | Description |\n"
    md += "|-------|------|----------|-------------|\n"
    for name, info in fields.items():
        req = 'Yes' if info['required'] else 'No'
        desc = info['description'].replace('\\n', ' ').replace('\n', ' ')
        md += f"| `{name}` | `{info['type']}` | {req} | {desc} |\n"
    md += "\n"
    return md

def generate_markdown(yaml_file, out_file):
    with open(yaml_file, 'r') as f:
        spec = yaml.safe_load(f)
        
    md = "# NimbusU API Documentation\n\n"
    md += f"Version: {spec.get('info', {}).get('version', '')}\n\n"
    md += f"{spec.get('info', {}).get('description', '')}\n\n"
    
    paths = spec.get('paths', {})
    groups = defaultdict(list)
    
    for path, methods in paths.items():
        for method, operation in methods.items():
            if method.lower() not in ['get', 'post', 'put', 'patch', 'delete']:
                continue
            tags = operation.get('tags', ['Other'])
            tag_name = tags[0] if tags else 'Other'
            tag_name = tag_name.replace('_', ' ').title()
            groups[tag_name].append({
                'path': path,
                'method': method,
                'operation': operation
            })

    for group_name in sorted(groups.keys()):
        md += f"# {group_name} APIs\n\n"
        for op_info in groups[group_name]:
            path = op_info['path']
            method = op_info['method']
            operation = op_info['operation']
            
            op_id = operation.get('operationId', f"{method}_{path}")
            summary = operation.get('summary', operation.get('description', op_id))
            if not summary:
                 summary = f"{method.upper()} {path}"
            
            md += f"## `{method.upper()} {path}`\n\n"
            md += f"**Summary**: {summary}\n\n"
            
            # Parameters
            params = operation.get('parameters', [])
            if params:
                md += "#### Parameters\n\n"
                md += "| Name | In | Type | Required | Description |\n"
                md += "|------|----|------|----------|-------------|\n"
                for p in params:
                    p_name = p.get('name', '')
                    p_in = p.get('in', '')
                    p_req = 'Yes' if p.get('required', False) else 'No'
                    p_desc = p.get('description', '').replace('\\n', ' ').replace('\n', ' ')
                    p_schema = p.get('schema', {})
                    p_type = p_schema.get('type', 'string')
                    if p_schema.get('format'):
                        p_type += f" ({p_schema.get('format')})"
                    md += f"| `{p_name}` | `{p_in}` | `{p_type}` | {p_req} | {p_desc} |\n"
                md += "\n"
            
            # Request Body
            req_body = operation.get('requestBody', {})
            content = req_body.get('content', {})
            json_content = content.get('application/json', {})
            req_schema = json_content.get('schema', {})
            
            if req_schema:
                fields = get_schema_fields(req_schema, spec)
                if fields:
                    md += markdown_for_fields(fields, "Request Payload")
                example = generate_example(req_schema, spec)
                if example:
                    md += "**Example Request**:\n"
                    md += "```json\n"
                    md += json.dumps(example, indent=2) + "\n"
                    md += "```\n\n"
                
            # Responses
            responses = operation.get('responses', {})
            for code, resp in responses.items():
                desc = resp.get('description', '').replace('\n', ' ')
                md += f"#### Response: {code} {desc}\n\n"
                resp_content = resp.get('content', {})
                resp_json = resp_content.get('application/json', {})
                resp_schema = resp_json.get('schema', {})
                
                if resp_schema:
                    fields = get_schema_fields(resp_schema, spec)
                    if fields:
                        md += markdown_for_fields(fields, "Response Payload")
                    elif '$ref' in resp_schema:
                        md += f"Type: `{resp_schema['$ref'].split('/')[-1]}`\n\n"
                    elif resp_schema.get('type') == 'array':
                        items = resp_schema.get('items', {})
                        if '$ref' in items:
                            md += f"Type: `Array of {items['$ref'].split('/')[-1]}`\n\n"
                    elif 'type' in resp_schema:
                        md += f"Type: `{resp_schema.get('type')}`\n\n"
                        
                    example = generate_example(resp_schema, spec)
                    if example:
                        md += "**Example Response**:\n"
                        md += "```json\n"
                        md += json.dumps(example, indent=2) + "\n"
                        md += "```\n\n"
                        
            md += "---\n\n"

    with open(out_file, 'w') as f:
        f.write(md)
        print(f"Successfully wrote {out_file}")
        
if __name__ == '__main__':
    generate_markdown(sys.argv[1], sys.argv[2])
