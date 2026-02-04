document.addEventListener("DOMContentLoaded", () => {

    const resume = document.getElementById("resume");

    let selectedTemplate = "classic";
    let selectedColor = "#2f80ed";
    let selectedFont = "Arial";

    const get = id => document.getElementById(id);

    function bullets(text) {
        return text
        .split("\n")
        .filter(x => x.trim())
        .map(x => "• " + x)
        .join("\n");
    }

    /* ---------- LIVE PREVIEW ---------- */

    const fields = [
        "name","email","phone","address",
        "summary","skills","languages",
        "experience","education",
        "certifications","profiles",
    ];

    fields.forEach(id => {
        const input = get(id);
        const preview = get("p-" + id);

        if(!input || !preview) return;

        input.addEventListener("input", () => {
        if(["skills","languages","experience"].includes(id)){
            preview.innerText = bullets(input.value);
        } else {
            preview.innerText = input.value;
        }
        updateScore();
        });
    });

    // ===== HOBBIES LIVE PREVIEW =====
    get("hobbies").addEventListener("input", () => {
        const val = get("hobbies").value.trim();

        get("p-hobbies").innerText = val;

        get("hobbies-section").style.display = val ? "block" : "none";
    });

    // ===== DISCLAIMER LIVE PREVIEW =====
    get("disclaimer").addEventListener("input", () => {
        const val = get("disclaimer").value.trim();

        get("p-disclaimer").innerText = val;

        get("disclaimer-section").style.display = val ? "block" : "none";
    });


    /* ---------- TEMPLATE SWITCH ---------- */

    document.querySelectorAll(".template-card").forEach(card => {
        card.addEventListener("click", () => {
        document.querySelectorAll(".template-card")
            .forEach(c => c.classList.remove("active"));

        card.classList.add("active");
        selectedTemplate = card.dataset.template;

        resume.className = "preview-box " + selectedTemplate;
        });
    });

    /* ---------- COLOR ---------- */

    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", () => {
        selectedColor = btn.dataset.color;

        resume.querySelectorAll("h3").forEach(h=>{
            h.style.color = selectedColor;
        });

        get("p-name").style.color = selectedColor;
        });
    });

    /* ---------- FONT ---------- */

    get("fontPicker").addEventListener("change", e => {
        selectedFont = e.target.value;
        resume.style.fontFamily = selectedFont;
    });

    /* ---------- DRAG ---------- */

    document.querySelectorAll(".section").forEach(sec => {
        sec.addEventListener("dragstart", ()=>sec.classList.add("dragging"));
        sec.addEventListener("dragend", ()=>sec.classList.remove("dragging"));
    });

    resume.addEventListener("dragover", e => {
        e.preventDefault();

        const dragging = document.querySelector(".dragging");
        if(!dragging) return;

        const items = [...resume.querySelectorAll(".section:not(.dragging)")];

        const after = items.find(el =>
        e.clientY < el.getBoundingClientRect().top + el.offsetHeight / 2
        );

        after ? after.before(dragging) : resume.appendChild(dragging);
    });

    /* ---------- RESUME SCORE ---------- */

    function updateScore(){
        let filled = 0;

        fields.forEach(id=>{
            if(get(id)?.value.trim()) filled++;
        });

        const percent = Math.round((filled / fields.length) * 100);

        /* ===== SCORE COLOR ===== */

        const scoreEl = get("resumeScore");
        scoreEl.innerText = percent + "%";

        scoreEl.style.color =
            percent < 40 ? "#ef4444" :
            percent < 75 ? "#f59e0b" :
            "#22c55e";

        get("missingText").innerText =
            percent === 100 ? "Perfect resume!" : "Improve your resume";

        /* ===== SMART TIPS ===== */

        const tips = [];

        if(!get("summary").value.trim())
            tips.push("Add a strong professional summary");

        if(!get("skills").value.trim())
            tips.push("Include at least 5 key skills");

        if(!get("experience").value.trim())
            tips.push("Fill your experience section");

        if(!get("education").value.trim())
            tips.push("Add your education details");

        const tipsBox = document.querySelector(".tips-box ul");

        tipsBox.innerHTML = tips.length
            ? tips.map(t => `<li>${t}</li>`).join("")
            : "<li>Your resume looks perfect!</li>";
    }


    /* ---------- DOWNLOAD ---------- */

    get("downloadBtn").addEventListener("click", async () => {

        const form = document.querySelector(".form-box");
        const data = Object.fromEntries(new FormData(form).entries());

        const order = [];

        document.querySelectorAll("#resume .section").forEach(sec=>{
            const h = sec.querySelector("h3,h1");
            if(!h) return;

            const name = h.innerText.trim().toLowerCase();

            if(name.includes("summary")) order.push("summary");
            else if(name.includes("skills")) order.push("skills");
            else if(name.includes("languages")) order.push("languages");
            else if(name.includes("experience")) order.push("experience");
            else if(name.includes("education")) order.push("education");
            else if(name.includes("certifications")) order.push("certifications");
            else if(name.includes("profiles")) order.push("profiles");
            else if(name.includes("hobbies")) order.push("hobbies");
            else if(name.includes("disclaimer")) order.push("disclaimer");
        });

        data.order = order;
        data.template = selectedTemplate;
        data.color = selectedColor;
        data.font = selectedFont;
        data.ats = document.getElementById("atsToggle")?.checked || false;

        const res = await fetch("/download",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(data)
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        a.click();
    });

    /* ---------- FULLSCREEN PREVIEW ---------- */

    const fullscreenBtn = document.getElementById("fullscreenBtn");

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {

            const overlay = document.createElement("div");
            overlay.className = "fullscreen-overlay";

            const clone = resume.cloneNode(true);
            clone.style.display = "block";

            overlay.appendChild(clone);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", () => overlay.remove());

            document.addEventListener("keydown", e => {
                if (e.key === "Escape") overlay.remove();
            }, { once:true });

        });
    }

  
  

});
