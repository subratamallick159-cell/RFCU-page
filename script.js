/* =====================================================
   RONALDIANS OF BENGAL
   MAIN JAVASCRIPT
   SUPABASE + WEBSITE FUNCTIONS
===================================================== */

const SUPABASE_URL =
    "https://qwwrusjteykwsfeplutt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_NQfFAIXzd-MIYcsiEFYM5Q_ueMij0SL";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const nav = document.querySelector(".navbar nav");

    if (menuBtn && nav) {

        menuBtn.addEventListener("click", () => {

            nav.classList.toggle("active");

            menuBtn.textContent =
                nav.classList.contains("active")
                    ? "✕"
                    : "☰";

        });

        document.querySelectorAll(".navbar nav a").forEach(link => {

            link.addEventListener("click", () => {

                nav.classList.remove("active");
                menuBtn.textContent = "☰";

            });

        });

    }


    /* =====================================================
       LOGIN FORM — SUPABASE
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const loginValue =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value
                    .trim();

            if (loginValue === "" || password === "") {

                alert(
                    "Please enter your login details."
                );

                return;
            }

            if (!loginValue.includes("@")) {

                alert(
                    "Please login using the email address you registered with."
                );

                return;
            }

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: loginValue,
                    password: password

                });

            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Login failed.\n\n" +
                    error.message
                );

                return;
            }

            if (!data.user) {

                alert(
                    "Login failed. Please try again."
                );

                return;
            }

            const userId =
                data.user.id;

            const { data: member, error: memberError } =
                await supabaseClient
                    .from("members")
                    .select("login_count")
                    .eq("id", userId)
                    .single();

            if (memberError) {

                console.error(
                    "Member profile lookup error:",
                    memberError
                );

                await supabaseClient.auth.signOut();

                alert(
                    "Your account exists, but your member profile was not found.\n\n" +
                    "Please register again or contact the administrator."
                );

                return;
            }

            const newLoginCount =
                Number(member.login_count || 0) + 1;

            const { error: updateError } =
                await supabaseClient
                    .from("members")
                    .update({

                        last_login:
                            new Date().toISOString(),

                        login_count:
                            newLoginCount

                    })
                    .eq("id", userId);

            if (updateError) {

                console.error(
                    "Login tracking error:",
                    updateError
                );

            }

            alert(
                "Login successful! ❤️\n\n" +
                "Welcome to Ronaldo Fans Club Ultadanga."
            );

            loginForm.reset();

        });

    }


    /* =====================================================
       JOIN OUR COMMUNITY — SUPABASE + WHATSAPP
    ===================================================== */

    const joinForm =
        document.getElementById("joinForm");

    if (joinForm) {

        joinForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const inputs =
                joinForm.querySelectorAll("input");

            const name =
                inputs[0].value.trim();

            const mobile =
                inputs[1].value.trim();

            const email =
                inputs[2]
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                inputs[3].value;

            const age =
                inputs[4].value.trim();


            /* Validation */

            if (
                name === "" ||
                mobile === "" ||
                email === "" ||
                password === "" ||
                age === ""
            ) {

                alert(
                    "Please fill all the fields."
                );

                return;
            }


            if (mobile.length < 10) {

                alert(
                    "Please enter a valid mobile number."
                );

                return;
            }


            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            /* Create Supabase Auth account */

            const { data, error } =
                await supabaseClient.auth.signUp({

                    email: email,
                    password: password

                });


            if (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Registration failed.\n\n" +
                    error.message
                );

                return;
            }


            if (!data.user) {

                alert(
                    "Registration could not be completed. Please try again."
                );

                return;
            }


            /*
             * EMAIL CONFIRMATION
             * WhatsApp will also open here.
             */

            if (!data.session) {

                alert(
                    "Account created successfully! ❤️\n\n" +
                    "Please confirm your email.\n\n" +
                    "Opening WhatsApp..."
                );

                const whatsappNumber =
                    "916296277118";

                const whatsappMessage =
                    "Hello Ronaldo Fans Club Ultadanga! ❤️\n\n" +
                    "I have successfully joined the community.\n\n" +
                    "Name: " + name + "\n" +
                    "Mobile: " + mobile + "\n" +
                    "Email: " + email + "\n" +
                    "Age: " + age + "\n\n" +
                    "Thank you! ❤️";

                const whatsappURL =
                    "https://wa.me/" +
                    whatsappNumber +
                    "?text=" +
                    encodeURIComponent(
                        whatsappMessage
                    );

                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );

                joinForm.reset();

                return;
            }


            /* Save member profile */

            const { error: profileError } =
                await supabaseClient
                    .from("members")
                    .insert({

                        id:
                            data.user.id,

                        name:
                            name,

                        email:
                            email,

                        mobile:
                            mobile,

                        last_login:
                            null,

                        login_count:
                            0

                    });


            if (profileError) {

                console.error(
                    "Member profile error:",
                    profileError
                );

                await supabaseClient.auth.signOut();

                alert(
                    "Account was created, but member information could not be saved.\n\n" +
                    profileError.message
                );

                return;
            }


            /* Registration successful */

            alert(
                "Welcome to Ronaldo Fans Club Ultadanga, " +
                name +
                "! ❤️\n\n" +
                "Your community account has been created successfully."
            );


            /* =================================================
               JOIN NOW → WHATSAPP
            ================================================= */

            const whatsappNumber =
                "916296277118";

            const whatsappMessage =
                "Hello Ronaldo Fans Club Ultadanga! ❤️\n\n" +
                "I have successfully joined the community.\n\n" +
                "Name: " + name + "\n" +
                "Mobile: " + mobile + "\n" +
                "Email: " + email + "\n" +
                "Age: " + age + "\n\n" +
                "Thank you! ❤️";

            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(
                    whatsappMessage
                );

            window.location.href = whatsappURL;

        
        });

    }


    /* =====================================================
       FAQ ACCORDION
    ===================================================== */

    const faqQuestions =
        document.querySelectorAll(
            ".faq-question"
        );

    faqQuestions.forEach(question => {

        question.addEventListener("click", () => {

            const currentItem =
                question.parentElement;

            document
                .querySelectorAll(".faq-item")
                .forEach(item => {

                    if (item !== currentItem) {

                        item.classList.remove(
                            "active"
                        );

                    }

                });

            currentItem.classList.toggle(
                "active"
            );

        });

    });


    /* =====================================================
       CART SYSTEM
    ===================================================== */

    const addToCartBtn =
        document.getElementById(
            "addToCartBtn"
        );

    const shirtSize =
        document.getElementById(
            "shirtSize"
        );

    const cartSidebar =
        document.getElementById(
            "cartSidebar"
        );

    const closeCart =
        document.getElementById(
            "closeCart"
        );

    const cartItems =
        document.getElementById(
            "cartItems"
        );

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );

    const checkoutBtn =
        document.getElementById(
            "checkoutBtn"
        );

    let cart = [];


    /* =====================================================
       ADD PRODUCT
    ===================================================== */

    if (addToCartBtn) {

        addToCartBtn.addEventListener(
            "click",
            () => {

                const size =
                    shirtSize.value;

                if (size === "") {

                    alert(
                        "Please select a T-shirt size."
                    );

                    return;
                }

                const product = {

                    name:
                        "Ronaldians Of Bengal T-Shirt",

                    price:
                        449,

                    size:
                        size,

                    quantity:
                        1

                };

                const existingProduct =
                    cart.find(
                        item =>
                            item.name === product.name &&
                            item.size === product.size
                    );

                if (existingProduct) {

                    existingProduct.quantity++;

                } else {

                    cart.push(product);

                }

                updateCart();
                openCart();

            }
        );

    }


    /* =====================================================
       UPDATE CART
    ===================================================== */

    function updateCart() {

        if (!cartItems || !cartTotal) {

            return;

        }

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            cartItems.innerHTML = `
                <p class="empty-cart">
                    Your cart is empty.
                </p>
            `;

            cartTotal.textContent = "₹0";

            return;
        }

        let total = 0;

        cart.forEach(
            (item, index) => {

                const itemTotal =
                    item.price *
                    item.quantity;

                total += itemTotal;

                const cartItem =
                    document.createElement(
                        "div"
                    );

                cartItem.className =
                    "cart-item";

                cartItem.innerHTML = `

                    <div style="
                        padding:18px 0;
                        border-bottom:1px solid rgba(255,255,255,0.1);
                    ">

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:15px;
                        ">

                            <div>

                                <strong style="
                                    font-size:13px;
                                ">
                                    ${item.name}
                                </strong>

                                <p style="
                                    color:#888;
                                    font-size:11px;
                                    margin-top:5px;
                                ">
                                    Size: ${item.size}
                                </p>

                                <p style="
                                    color:#aaa;
                                    font-size:11px;
                                    margin-top:3px;
                                ">
                                    ₹${item.price} × ${item.quantity}
                                </p>

                                <p style="
                                    color:#fff;
                                    font-size:12px;
                                    margin-top:4px;
                                    font-weight:700;
                                ">
                                    Subtotal: ₹${itemTotal}
                                </p>

                            </div>

                            <button
                                class="remove-cart-item"
                                data-index="${index}"
                                type="button"
                                aria-label="Remove item"
                                style="
                                    background:none;
                                    border:none;
                                    color:#e50914;
                                    font-size:22px;
                                    cursor:pointer;
                                "
                            >
                                ×
                            </button>

                        </div>

                    </div>

                `;

                cartItems.appendChild(
                    cartItem
                );

            }
        );

        cartTotal.textContent =
            "₹" + total;


        /* Remove item */

        document
            .querySelectorAll(
                ".remove-cart-item"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        cart.splice(
                            index,
                            1
                        );

                        updateCart();

                    }
                );

            });

    }


    /* =====================================================
       OPEN CART
    ===================================================== */

    function openCart() {

        if (cartSidebar) {

            cartSidebar.classList.add(
                "active"
            );

        }

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    if (closeCart) {

        closeCart.addEventListener(
            "click",
            () => {

                if (cartSidebar) {

                    cartSidebar.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    /* =====================================================
       CHECKOUT → WHATSAPP
    ===================================================== */

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            () => {

                if (cart.length === 0) {

                    alert(
                        "Your cart is empty."
                    );

                    return;
                }

                let message =
                    "Hello Ronaldians of Bengal! ❤️\n\n";

                message +=
                    "I want to order:\n\n";

                let total = 0;

                cart.forEach(item => {

                    const itemTotal =
                        item.price *
                        item.quantity;

                    total += itemTotal;

                    message +=
                        "Product: " +
                        item.name +
                        "\n";

                    message +=
                        "Size: " +
                        item.size +
                        "\n";

                    message +=
                        "Quantity: " +
                        item.quantity +
                        "\n";

                    message +=
                        "Price: ₹" +
                        itemTotal +
                        "\n\n";

                });

                message +=
                    "Total: ₹" +
                    total;

                const whatsappNumber =
                    "916296277118";

                const whatsappURL =
                    "https://wa.me/" +
                    whatsappNumber +
                    "?text=" +
                    encodeURIComponent(
                        message
                    );

                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    /* =====================================================
       QR DONATION MODAL
    ===================================================== */

    const donateBtn =
        document.getElementById(
            "donateBtn"
        );

    const qrModal =
        document.getElementById(
            "qrModal"
        );

    const qrClose =
        document.getElementById(
            "qrClose"
        );


    function openQRModal() {

        if (!qrModal) {

            return;

        }

        qrModal.classList.add(
            "show"
        );

        qrModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "qr-open"
        );

    }


    function closeQRModal() {

        if (!qrModal) {

            return;

        }

        qrModal.classList.remove(
            "show"
        );

        qrModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "qr-open"
        );

    }


    if (donateBtn) {

        donateBtn.addEventListener(
            "click",
            openQRModal
        );

    }


    if (qrClose) {

        qrClose.addEventListener(
            "click",
            closeQRModal
        );

    }


    /* Click outside */

    if (qrModal) {

        qrModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    qrModal
                ) {

                    closeQRModal();

                }

            }
        );

    }


    /* ESC key */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                qrModal &&
                qrModal.classList.contains(
                    "show"
                )
            ) {

                closeQRModal();

            }

        }
    );


    /* =====================================================
       REVIEW FORM
    ===================================================== */

    const reviewForm =
        document.getElementById(
            "reviewForm"
        );

    if (reviewForm) {

        reviewForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    reviewForm
                        .querySelector(
                            'input[type="text"]'
                        )
                        .value
                        .trim();

                if (name === "") {

                    alert(
                        "Please enter your name."
                    );

                    return;
                }

                alert(
                    "Thank you, " +
                    name +
                    "! ⭐\n\n" +
                    "Your review has been submitted."
                );

                reviewForm.reset();

            }
        );

    }


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                alert(
                    "Thank you for contacting Ronaldians of Bengal! ❤️\n\n" +
                    "We will get back to you soon."
                );

                contactForm.reset();

            }
        );

    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.getElementById(
            "backToTop"
        );

    window.addEventListener(
        "scroll",
        () => {

            if (!backToTop) {

                return;

            }

            if (
                window.scrollY > 500
            ) {

                backToTop.classList.add(
                    "show"
                );

            } else {

                backToTop.classList.remove(
                    "show"
                );

            }

        }
    );


    if (backToTop) {

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".navbar nav a"
        );

    window.addEventListener(
        "scroll",
        () => {

            let currentSection = "";

            sections.forEach(
                section => {

                    const sectionTop =
                        section.offsetTop -
                        150;

                    const sectionHeight =
                        section.offsetHeight;

                    if (
                        window.scrollY >=
                            sectionTop &&
                        window.scrollY <
                            sectionTop +
                            sectionHeight
                    ) {

                        currentSection =
                            section.getAttribute(
                                "id"
                            );

                    }

                }
            );

            navLinks.forEach(
                link => {

                    link.classList.remove(
                        "active"
                    );

                    if (
                        link.getAttribute(
                            "href"
                        ) ===
                        "#" +
                        currentSection
                    ) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       SIMPLE SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".community-card, " +
            ".review-card, " +
            ".legacy-card, " +
            ".timeline-item, " +
            ".product-card, " +
            ".about-container, " +
            ".join-container, " +
            ".helping-container"
        );

    if (
        "IntersectionObserver"
        in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.style.opacity =
                                    "1";

                                entry.target.style.transform =
                                    "translateY(0)";

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.1
                }
            );

        revealElements.forEach(
            element => {

                element.style.opacity =
                    "0";

                element.style.transform =
                    "translateY(30px)";

                element.style.transition =
                    "opacity 0.7s ease, transform 0.7s ease";

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.style.opacity =
                    "1";

                element.style.transform =
                    "translateY(0)";

            }
        );

    }


    /* =====================================================
       INITIALIZE CART
    ===================================================== */

    updateCart();

});