/* Sentra Technologies - shared behaviour: mobile menu, footer year, enquiry form */
(function () {
  "use strict";

  /* ---- Mobile navigation ---- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (header && toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Enquiry form: opens the visitor's email app with the details filled in.
         No backend needed. To change where enquiries go, edit TO below. ---- */
  var form = document.getElementById("enquiry");
  if (form) {
    var TO = "lohan@sentratechnologies.com";
    var status = document.getElementById("enquiry-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };
      var subject = "Enquiry: " + (v("f-interest") || "General") + " - " + (v("f-company") || v("f-name"));
      var lines = [
        "Name: " + v("f-name"),
        "Company: " + v("f-company"),
        "Email: " + v("f-email"),
        "Phone: " + v("f-phone"),
        "Trade: " + v("f-trade"),
        "Foremen on site: " + v("f-foremen"),
        "Interested in: " + v("f-interest"),
        "",
        v("f-message")
      ];
      window.location.href =
        "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\r\n"));
      if (status) {
        status.textContent = "Your email app should open with the details filled in. If it does not, email " + TO + " directly.";
      }
    });
  }
})();
