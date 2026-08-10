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

  const rand = (min, max) =>
    Math.random() * (max - min) + min;

  const isMobile = () =>
    window.matchMedia("(max-width: 700px)").matches;

  /*
   * priority が設定されている作品を先にする。
   * priority がない作品は自動的に後ろへ。
   */
  function priorityOf(card) {
    const value = Number(card.dataset.priority);

    if (Number.isFinite(value)) {
      return value;
    }

    return 9999;
  }

  function orderedCards() {
    return [...cards].sort((a, b) => {
      const pa = priorityOf(a);
      const pb = priorityOf(b);

      if (pa !== pb) {
        return pa - pb;
      }

      return cards.indexOf(a) - cards.indexOf(b);
    });
  }

  /*
   * PC
   * --------------------------------
   * 今まで通り、少しランダムで実験的な配置。
   */
  function placeDesktop() {
    const positions = [
      [4, 10],
      [27, 5],
      [51, 12],
      [72, 8],
      [10, 32],
      [35, 29],
      [59, 33],
      [77, 37],
      [4, 60],
      [28, 57],
      [52, 61],
      [73, 64]
    ];

    const ordered = orderedCards();

    ordered.forEach((card, i) => {
      const preset = positions[i % positions.length];

      const x =
        card.dataset.x !== ""
          ? Number(card.dataset.x)
          : preset[0] + rand(-2.5, 2.5);

      const y =
        card.dataset.y !== ""
          ? Number(card.dataset.y)
          : preset[1] + rand(-2.5, 2.5);

      const rotate =
        card.dataset.rotate !== ""
          ? Number(card.dataset.rotate)
          : rand(-5, 5);

      const z =
        card.dataset.z !== ""
          ? Number(card.dataset.z)
          : i + 1;

      const width =
        Number(card.dataset.width) || rand(21, 27);

      card.style.setProperty(
        "--w",
        `${width}vw`
      );

      card.style.setProperty(
        "--mobile-w",
        `${Math.min(84, Math.max(72, width * 3.05))}vw`
      );

      card.style.left = `${x}%`;
      card.style.top = `${y}%`;
      card.style.zIndex = z;

      card.style.transform =
        `rotate(${rotate}deg) scale(1)`;

      card.dataset.baseRotate = rotate;
      card.classList.remove("is-active");
    });
  }

  /*
   * スマホ
   * --------------------------------
   * 写真を横に詰め込みすぎない。
   *
   * 1枚・2枚・3枚の組み合わせを
   * 完全な規則にはせず、少しランダムにする。
   */
  function placeMobile() {
    const ordered = orderedCards();

    const layouts = [
      { count: 1, gap: 6 },
      { count: 2, gap: 3 },
      { count: 2, gap: 5 },
      { count: 3, gap: 2 },
      { count: 2, gap: 6 },
      { count: 1, gap: 7 },
      { count: 2, gap: 4 }
    ];

    let cursor = 0;
    let row = 0;

    while (cursor < ordered.length) {
      const layout =
        layouts[row % layouts.length];

      const remaining =
        ordered.length - cursor;

      const count =
        Math.min(layout.count, remaining);

      const gap = layout.gap;

      const rowTop =
        5 + row * 18;

      const usable =
        100 - (gap * (count - 1)) - 8;

      const itemWidth =
        count === 1
          ? Math.min(88, usable)
          : usable / count;

      for (let j = 0; j < count; j++) {
        const card = ordered[cursor + j];

        const manualWidth =
          Number(card.dataset.width);

        const width =
          Number.isFinite(manualWidth) &&
          manualWidth > 0
            ? Math.min(88, Math.max(30, manualWidth * 3.4))
            : itemWidth;

        const centerOffset =
          count === 1
            ? (100 - width) / 2
            : 4 + j * (usable / count);

        const x =
          count === 1
            ? centerOffset
            : centerOffset + rand(-1.5, 1.5);

        const y =
          rowTop + rand(-1.5, 1.5);

        const rotate =
          card.dataset.rotate !== ""
            ? Number(card.dataset.rotate)
            : rand(-3.5, 3.5);

        /*
         * 同じ行の写真が完全に重ならないようにする。
         */
        const z =
          100 +
          row * 10 +
          j;

        card.style.setProperty(
          "--mobile-w",
          `${width}vw`
        );

        card.style.left =
          `${Math.max(2, Math.min(x, 100 - width - 2))}%`;

        card.style.top =
          `${y}%`;

        card.style.zIndex = z;

        card.style.transform =
          `rotate(${rotate}deg) scale(1)`;

        card.dataset.baseRotate = rotate;

        card.classList.remove("is-active");
      }

      cursor += count;
      row++;
    }

    /*
     * 写真の枚数が増えても、
     * 画面の下が足りなくならないようにする。
     */
    stage.style.minHeight =
      `${Math.max(150, row * 18 + 35)}vh`;
  }

  function place() {
    if (isMobile()) {
      placeMobile();
    } else {
      placeDesktop();
    }
  }

  place();

  /*
   * 画面サイズがPC ⇄ スマホで変わったときも再配置。
   */
  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      place();
    }, 150);
  });

  /*
   * 閉じるボタン
   */
  document
    .querySelectorAll(".window-close")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const card =
          button.closest(".window-card");

        if (card) {
          card.classList.toggle("is-closed");
        }
      });
    });

  /*
   * 左下の番号
   *
   * クリックした写真を最前面へ。
   */
  document
    .querySelectorAll("[data-target]")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const index =
          Number(button.dataset.target);

        const card = cards[index];

        if (!card) return;

        cards.forEach((item) => {
          item.classList.remove("is-active");
        });

        card.classList.remove("is-closed");
        card.classList.add("is-active");

        const rotate =
          Number(card.dataset.baseRotate || 0);

        card.style.zIndex = 999;

        card.style.transform =
          `rotate(${rotate}deg) scale(3)`;

        setTimeout(() => {
          card.style.transform =
            `rotate(${rotate}deg) scale(1)`;

          card.classList.remove("is-active");
        }, 1200);
      });
    });

  /*
   * シャッフル
   */
  const shuffleButton =
    document.querySelector("[data-shuffle]");

  if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
      place();
    });
  }
})();
