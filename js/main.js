/* Jannalee Physiotherapy — minimal site JS
   Mobile nav toggle + static contact-form confirmation.
   No backend; form submission is intercepted and shows a thank-you message. */

(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the menu when a link is tapped (mobile)
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Static contact form ---- */
  /* When a real booking backend (or Jane App embed) is wired up, replace this
     block with the real submit handler. For now it just confirms on screen. */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var success = document.getElementById("formSuccess");
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
      form.reset();
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---- Team bios + booking requests open in popups (team page) ---- */
  /* "Read Bio" copies a card's hidden bio into #bioModal. "Book with Me"
     opens #bookModal pre-set to that physio; submitting sends Karen a request. */
  var bioModal = document.getElementById("bioModal");
  var bookModal = document.getElementById("bookModal");
  var lastTrigger = null;

  function showModal(modalEl, focusEl) {
    modalEl.hidden = false;
    document.body.classList.add("modal-open");
    if (focusEl) focusEl.focus();
  }
  function hideModal(modalEl) {
    modalEl.hidden = true;
    if ((!bioModal || bioModal.hidden) && (!bookModal || bookModal.hidden)) {
      document.body.classList.remove("modal-open");
    }
  }
  function closeAndRestore(modalEl) {
    hideModal(modalEl);
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }
  function bindClose(modalEl) {
    modalEl.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) closeAndRestore(modalEl);
    });
  }

  /* Open the booking-request form, pre-set to a physio */
  function openBook(physioName, trigger) {
    if (!bookModal) return;
    var field = document.getElementById("bookPhysioField");
    var nameSpan = document.getElementById("bookPhysioName");
    var form = document.getElementById("bookForm");
    var success = document.getElementById("bookSuccess");
    if (form) { form.reset(); form.hidden = false; }
    if (success) success.classList.remove("show");
    if (field) field.value = physioName || "";
    if (nameSpan) nameSpan.textContent = physioName || "";
    lastTrigger = trigger || lastTrigger;
    showModal(bookModal, document.getElementById("bookName"));
  }

  /* Bio popup */
  if (bioModal) {
    var mName = document.getElementById("bioModalName");
    var mCreds = document.getElementById("bioModalCreds");
    var mBio = document.getElementById("bioModalBio");
    var mBook = document.getElementById("bioModalBook");

    document.querySelectorAll(".member-readbio").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".member");
        if (!card) return;
        var name = card.querySelector(".member-name");
        var creds = card.querySelector(".member-creds");
        var bio = card.querySelector(".member-bio-content");
        mName.textContent = name ? name.textContent : "";
        mCreds.textContent = creds ? creds.textContent : "";
        mBio.innerHTML = bio ? bio.innerHTML : "";
        mBook.hidden = !card.querySelector(".member-book");
        lastTrigger = btn;
        showModal(bioModal, bioModal.querySelector(".bio-modal-close"));
      });
    });

    // From the bio popup, the Book button opens the booking form for that person
    if (mBook) {
      mBook.addEventListener("click", function () {
        var name = mName.textContent;
        hideModal(bioModal);
        openBook(name, mBook);
      });
    }
    bindClose(bioModal);
  }

  /* Card "Book with Me" buttons (only the ones inside a .member card) */
  document.querySelectorAll(".member .member-book").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".member");
      var name = card ? card.querySelector(".member-name") : null;
      openBook(name ? name.textContent : "", btn);
    });
  });

  /* Booking form submit + close */
  if (bookModal) {
    var bookForm = document.getElementById("bookForm");
    var bookSuccess = document.getElementById("bookSuccess");
    var bookSuccessName = document.getElementById("bookSuccessName");
    var bookField = document.getElementById("bookPhysioField");
    if (bookForm) {
      bookForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!bookForm.checkValidity()) { bookForm.reportValidity(); return; }
        /* TODO: POST to a form backend (Formspree / GHL webhook) so Karen gets
           the request by email. Until that's wired, this confirms on screen only. */
        if (bookSuccessName) bookSuccessName.textContent = bookField ? bookField.value : "";
        bookForm.hidden = true;
        if (bookSuccess) bookSuccess.classList.add("show");
      });
    }
    bindClose(bookModal);
  }

  /* Esc closes whichever popup is open */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (bookModal && !bookModal.hidden) closeAndRestore(bookModal);
    else if (bioModal && !bioModal.hidden) closeAndRestore(bioModal);
  });
})();
