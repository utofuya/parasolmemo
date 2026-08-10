(function () {
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const d = new Date();
    const clock = document.getElementById("clock");
    const today = document.getElementById("today");

    if (clock) {
      clock.textContent =
        `${pad(d.getHours())} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())}`;
    }

    if (today) {
      today.textContent =
        `${d.getFullYear()} . ${pad(d.getMonth() + 1)} . ${pad(d.getDate())}`;
    }
  }

  tick();
  setInterval(tick, 1000);

  const cards = [...document.querySelectorAll(".window-card")];
  const stage = document.getElementById("archiveStage");

  if (!cards.length || !stage) return;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function place() {
    const positions = [
      [4, 8],
      [24, 5],
      [47, 10],
      [69, 7],
      [12, 32],
      [35, 29],
      [58, 31],
      [79, 34],
      [4, 59],
      [25, 55],
      [50, 58],
      [72, 60]
    ];

    cards.forEach((card, i) => {
      const preset = positions[i % positions.length];

      const x = card.dataset.x !== ""
        ? Number(card.dataset.x)
        : preset[0] + rand(-3, 3);

      const y = card.dataset.y !== ""
        ? Number(card.dataset.y)
        : preset[1] + rand(-3, 3);

      const rotate = card.dataset.rotate !== ""
        ? Number(card.dataset.rotate)
        : rand(-5, 5);

      const z = card.dataset.z !== ""
        ? Number(card.dataset.z)
        : i + 1;

      const width = Number(card.dataset.width) || rand(17, 22);

      card.style.width = `${width}vw`;
      card.style.left = `${x}%`;
      card.style.top = `${y}%`;
      card.style.zIndex = z;
      card.style.transform = `rotate(${rotate}deg) scale(1)`;

      card.dataset.baseRotate = rotate;
      card.classList.remove("is-active");
    });
  }

  place();

  document.querySelectorAll(".window-close").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card = button.closest(".window-card");

      if (card) {
        card.classList.toggle("is-closed");
      }
    });
  });

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const index = Number(button.dataset.target);
      const card = cards[index];

      if (!card) return;

      cards.forEach((item) => {
        item.classList.remove("is-active");
      });

      card.classList.remove("is-closed");
      card.classList.add("is-active");

      const rotate = Number(card.dataset.baseRotate || 0);

      card.style.zIndex = 999;
      card.style.transform =
        `rotate(${rotate}deg) scale(1.12)`;

      setTimeout(() => {
        card.classList.remove("is-active");
      }, 900);
    });
  });

  const shuffleButton =
    document.querySelector("[data-shuffle]");

  if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
      place();
    });
  }
})();
