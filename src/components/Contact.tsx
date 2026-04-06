import { useState, FormEvent } from "react";
import {
  MdArrowOutward,
  MdCopyright,
  MdMailOutline,
  MdLocationOn,
} from "react-icons/md";
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa6";
import "./styles/Contact.css";
import { supabase } from "../lib/supabase";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

const education = [
  {
    degree: "Bachelor in Data Science",
    school: "FAST NUCES Karachi",
    years: "2024 — Present",
  },
  {
    degree: "Intermediate (HSC)",
    school: "Aga Khan Higher Secondary School",
    years: "2022 — 2024",
  },
  {
    degree: "Matriculation (SSC)",
    school: "Sultan Mohamad Shah Aga Khan School",
    years: "2022 — 2024",
  },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/esfanmerchant",
    Icon: FaGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/esfan-merchant-488817305/",
    Icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/merchantesfan/",
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61560831914681",
    Icon: FaFacebookF,
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submit.status === "submitting") return;

    setSubmit({ status: "submitting" });

    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });

    if (error) {
      setSubmit({
        status: "error",
        message: "Couldn't send your message. Please try again.",
      });
      return;
    }

    setSubmit({ status: "success" });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <span className="contact-eyebrow">Get in touch</span>
          <h3>Let's build something together</h3>
          <p className="contact-tagline">
            Have a project in mind, an internship, or just want to say hi?
            Drop a message below — I usually reply within a day.
          </p>
        </div>

        <div className="contact-grid">
          {/* ── Form card ── */}
          <div className="contact-card contact-card-form">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <label className="contact-field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="contact-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </label>
              </div>
              <label className="contact-field">
                <span>Message</span>
                <textarea
                  name="message"
                  placeholder="Tell me about your project, idea or opportunity…"
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                />
              </label>
              <button
                type="submit"
                data-cursor="disable"
                disabled={submit.status === "submitting"}
              >
                {submit.status === "submitting" ? "Sending…" : "Send message"}
                <MdArrowOutward />
              </button>
              {submit.status === "success" && (
                <p className="contact-form-status contact-form-success">
                  Thanks! Your message landed in my inbox.
                </p>
              )}
              {submit.status === "error" && (
                <p className="contact-form-status contact-form-error">
                  {submit.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Info card ── */}
          <div className="contact-card contact-card-info">
            <a
              href="mailto:esfanmerchant@gmail.com"
              className="contact-info-pill"
              data-cursor="disable"
            >
              <MdMailOutline />
              <span>esfanmerchant@gmail.com</span>
            </a>
            <div className="contact-info-pill contact-info-pill-static">
              <MdLocationOn />
              <span>Karachi, Pakistan</span>
            </div>

            <div className="contact-info-block">
              <h4>Connect</h4>
              <div className="contact-socials">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="disable"
                    className="contact-social"
                    aria-label={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="contact-info-block">
              <h4>Education</h4>
              <ul className="contact-education">
                {education.map((entry) => (
                  <li key={entry.degree + entry.school}>
                    <div className="contact-edu-dot" />
                    <div className="contact-edu-body">
                      <strong>{entry.degree}</strong>
                      <span>{entry.school}</span>
                      <em>{entry.years}</em>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="contact-footer">
          <p>
            Designed &amp; Developed by <span>Esfan Merchant</span>
          </p>
          <p>
            <MdCopyright /> 2026 — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
