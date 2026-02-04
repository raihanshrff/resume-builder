from flask import Flask, render_template, request, make_response
from weasyprint import HTML

app = Flask(__name__)

templates = {
    "classic": "resume_classic.html",
    "professional": "resume_professional.html",
    "modern": "resume_modern.html"
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/download", methods=["POST"])
def download():
    data = request.get_json()

    # ================= DEFAULT DISCLAIMER =================

    if not data.get("disclaimer") or not data["disclaimer"].strip():
        data["disclaimer"] = "I hereby declare that the above information is true and correct to the best of my knowledge and belief."

    # ================= AUTO SCALE =================

    content_length = sum(len(str(v)) for v in data.values())

    if content_length > 2300:
        data["scale"] = "0.88"
    elif content_length > 1800:
        data["scale"] = "0.92"
    else:
        data["scale"] = "1"

    # ================= SECTION ORDER =================

    sections = data.get("order", [])

    # Force optional sections if they contain data
    if data.get("hobbies") and "hobbies" not in sections:
        sections.append("hobbies")

    if data.get("disclaimer") and "disclaimer" not in sections:
        sections.append("disclaimer")

    # ================= TEMPLATE =================

    template_file = templates.get(
        data.get("template"),
        "resume_classic.html"
    )

    html = render_template(
        template_file,
        data=data,
        sections=sections
    )

    # ================= PDF GENERATION =================

    pdf = HTML(string=html).write_pdf()

    response = make_response(pdf)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "attachment; filename=resume.pdf"

    return response


if __name__ == "__main__":
    app.run(debug=True)
