// Contact + inquiry forms: inline validation, then either POST to the
// configured backend or hand the message to the visitor's email app.
document.querySelectorAll("form[data-form]").forEach((form) => {
  const status = form.querySelector(".form__status");
  const submit = form.querySelector('[type="submit"]');
  const endpoint = form.dataset.endpoint;
  const email = form.dataset.email;

  // /contact/photography/?type=Skate preselects the shoot type.
  const wanted = new URLSearchParams(location.search).get("type");
  const typeSelect = form.querySelector('select[name="type"]');
  if (wanted && typeSelect) {
    const match = [...typeSelect.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase());
    if (match) typeSelect.value = match.value;
  }

  const labelFor = (f) => form.querySelector(`label[for="${f.id}"]`)?.childNodes[0]?.textContent.trim() || f.name;
  const say = (text, kind) => {
    status.textContent = text;
    status.className = `form__status${kind ? ` is-${kind}` : ""}`;
  };
  const setError = (f, msg) => {
    f.setAttribute("aria-invalid", "true");
    let err = f.parentElement.querySelector(".field__error");
    if (!err) {
      err = document.createElement("p");
      err.className = "field__error";
      err.id = `${f.id}-error`;
      f.parentElement.append(err);
    }
    err.textContent = msg;
    f.setAttribute("aria-describedby", err.id);
  };
  const clearError = (f) => {
    f.removeAttribute("aria-invalid");
    f.removeAttribute("aria-describedby");
    f.parentElement.querySelector(".field__error")?.remove();
  };
  const messageFor = (f) =>
    f.validity.valueMissing
      ? "This one's required."
      : f.type === "email"
        ? "That doesn't look like an email address."
        : f.type === "url"
          ? "Use the full link, starting with https://"
          : "Please check this field.";

  form.addEventListener("input", (e) => {
    if (e.target.hasAttribute("aria-invalid") && e.target.checkValidity()) clearError(e.target);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("input, select, textarea")].filter((f) => f.name && f.name !== "_gotcha");
    let firstBad = null;
    for (const f of fields) {
      clearError(f);
      if (!f.checkValidity()) {
        setError(f, messageFor(f));
        firstBad ||= f;
      }
    }
    if (firstBad) {
      say("Please fix the highlighted fields.", "error");
      firstBad.focus();
      return;
    }
    if (form.querySelector('[name="_gotcha"]')?.value) return; // spam bot

    if (endpoint) {
      submit.disabled = true;
      say("Sending…");
      try {
        const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        say("Thanks, your message was sent.", "ok");
      } catch {
        say(`Sorry, that didn't go through. Please email ${email} directly.`, "error");
      } finally {
        submit.disabled = false;
      }
      return;
    }

    // No backend configured: open the visitor's email app with everything filled in.
    const lines = fields
      .filter((f) => f.value.trim() && f.type !== "textarea")
      .map((f) => `${labelFor(f)}: ${f.value.trim()}`);
    const message = fields.find((f) => f.type === "textarea")?.value.trim() || "";
    const name = fields.find((f) => f.autocomplete === "name")?.value.trim();
    const subject = `${form.dataset.subject}${name ? ` from ${name}` : ""}`;
    const body = `${lines.join("\n")}\n\n${message}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say(`Your email app should open with this message ready to send. If nothing happened, email ${email} directly.`, "ok");
  });
});
