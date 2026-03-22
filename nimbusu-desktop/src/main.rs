use gpui::prelude::*;
use gpui::*;
use gpui_component::{button::*, input::*, *};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct LoginResponse {
    access: String,
    refresh: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
}

pub struct SignInView {
    pub email_input: Entity<InputState>,
    pub password_input: Entity<InputState>,
    pub loading: bool,
    pub error: Option<SharedString>,
}

impl SignInView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        Self {
            email_input: cx.new(|cx| InputState::new(window, cx).placeholder("Email")),
            password_input: cx.new(|cx| {
                InputState::new(window, cx).placeholder("Password").masked(true)
            }),
            loading: false,
            error: None,
        }
    }

    fn login(&mut self, _window: &mut Window, cx: &mut Context<Self>) {
        let email = self.email_input.read(cx).text().to_string();
        let password = self.password_input.read(cx).text().to_string();

        if email.is_empty() || password.is_empty() {
            self.error = Some("Email and password are required".into());
            cx.notify();
            return;
        }

        self.loading = true;
        self.error = None;
        cx.notify();

        let async_cx = cx.to_async();
        cx.spawn(|view: gpui::WeakEntity<SignInView>, _cx: &mut gpui::AsyncApp| async move {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async move {
                let client = reqwest::Client::new();
            
            let login_res = client.post("http://localhost:8000/api/v1/auth/login/")
                .json(&serde_json::json!({
                    "email": email,
                    "password": password,
                }))
                .send()
                .await;

            match login_res {
                Ok(resp) => {
                    if resp.status().is_success() {
                        let data: Result<LoginResponse, _> = resp.json().await;
                        if let Ok(tokens) = data {
                            let me_res = client.get("http://localhost:8000/api/v1/users/me/")
                                .bearer_auth(&tokens.access)
                                .send()
                                .await;
                            
                            match me_res {
                                Ok(me_resp) => {
                                    if me_resp.status().is_success() {
                                        let user_data: Result<UserInfo, _> = me_resp.json().await;
                                        if let Ok(user) = user_data {
                                            println!("Sign in successful! user: {:?}", user);
                                        }
                                    } else {
                                        println!("Failed to get user details: {}", me_resp.status());
                                    }
                                }
                                Err(e) => println!("Error getting user details: {}", e),
                            }
                            
                            let _ = async_cx.update(|cx| {
                                let _ = view.update(cx, |this, cx| {
                                    this.loading = false;
                                    cx.notify();
                                });
                            });
                        }
                    } else {
                        let _ = async_cx.update(|cx| {
                            let _ = view.update(cx, |this, cx| {
                                this.error = Some("Invalid credentials".into());
                                this.loading = false;
                                cx.notify();
                            });
                        });
                    }
                }
                Err(e) => {
                    let _ = async_cx.update(|cx| {
                        let _ = view.update(cx, |this, cx| {
                            this.error = Some(format!("Network error: {}", e).into());
                            this.loading = false;
                            cx.notify();
                        });
                    });
                }
            }
            });
        }).detach();
    }
}

impl Render for SignInView {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let error_msg = self.error.clone();
        let is_loading = self.loading;

        div()
            .v_flex()
            .gap_4()
            .size_full()
            .items_center()
            .justify_center()
            .p_8()
            .child(
                div().text_xl().font_weight(FontWeight::BOLD).child("Sign In to NimbusU Desktop")
            )
            .when_some(error_msg, |this, msg| {
                this.child(div().text_color(gpui::red()).child(msg.clone()))
            })
            .child(
                div().w_64().child(
                    Input::new(&self.email_input)
                )
            )
            .child(
                div().w_64().child(
                    Input::new(&self.password_input)
                )
            )
            .child(
                Button::new("login_btn")
                    .primary()
                    .label(if is_loading { "Loading..." } else { "Sign In" })
                    .on_click(cx.listener(|this, _ev, window, cx| {
                        this.login(window, cx);
                    }))
            )
    }
}

fn main() {
    let app = gpui::Application::new().with_assets(gpui_component_assets::Assets);

    app.run(move |cx| {
        gpui_component::init(cx);

        cx.spawn(async move |cx| {
            cx.open_window(WindowOptions::default(), |window, cx| {
                let view = cx.new(|cx| SignInView::new(window, cx));
                cx.new(|cx| Root::new(view, window, cx))
            })
            .expect("Failed to open window");
        })
        .detach();
    });
}