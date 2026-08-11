(function () {
  const pad = n => String(n).padStart(2, "0");

  function tick() {
    const d = new Date();
    const c = document.getElementById("clock");
    const t = document.getElementById("today");

    if (c) {
      c.textContent =
        `${pad(d.getHours())} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())}`;
    }

    if (t) {
      t.textContent =
        `${d.getFullYear()} . ${pad(d.getMonth() + 1)} . ${pad(d.getDate())}`;
    }
  }

  tick();
  setInterval(tick, 1000);

  const cards = [...document.querySelectorAll(".window-card")];
  const stage = document.getElementById("archiveStage");

  if (!cards.length || !stage) return;

  const isMobile = () => window.innerWidth <= 700;

  /*
   * 1画面に置く写真の最大数
   * PC：11枚
   * スマホ：3枚
   */
  function cardsPerPage() {
    return isMobile() ? 3 : 11;
  }

  const rand = (a, b) => Math.random() * (b - a) + a;

  /*
   * 2つの写真がどのくらい重なっているか
   */
  function overlapRatio(a, b) {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);

    if (right <= left || bottom <= top) return 0;

    const intersection = (right - left) * (bottom - top);
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const smaller = Math.min(areaA, areaB);

    if (!smaller) return 0;

    return intersection / smaller;
  }

  /*
   * 写真の矩形を作る
   */
  function makeRect(x, y, width, height) {
    return {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
      width,
      height
    };
  }

  /*
   * 指定位置があるか
   */
  function hasManualPosition(el) {
    return (
      el.dataset.x !== "" ||
      el.dataset.y !== "" ||
      el.dataset.rotate !== "" ||
      el.dataset.z !== ""
    );
  }

  /*
   * 1ページ分の写真を配置
   */
  function placePage(pageCards, pageIndex, pageHeight) {
    const pageTop = pageIndex * pageHeight;
    const placed = [];

    /*
     * まず「位置を指定している写真」を配置。
     * 指定写真を先に置くことで、
     * おまかせ写真がそれらを避けられるようにする。
     */
    const manualCards = pageCards.filter(hasManualPosition);
    const autoCards = pageCards.filter(card => !hasManualPosition(card));

    /*
     * 手動指定
     */
    manualCards.forEach((el, i) => {
      const w = Number(el.dataset.width) ||
        (isMobile() ? 42 : 20);

      el.style.setProperty("--w", `${w}vw`);

      const cardWidth = el.offsetWidth;
      const cardHeight = el.offsetHeight;

      /*
       * x / y は「画面に対する％」
       */
      const xValue = el.dataset.x !== ""
        ? Number(el.dataset.x)
        : rand(5, 75);

      const yValue = el.dataset.y !== ""
        ? Number(el.dataset.y)
        : rand(10, 70);

      const x = window.innerWidth * xValue / 100;
      const y = pageTop + pageHeight * yValue / 100;

      const rotation = el.dataset.rotate !== ""
        ? Number(el.dataset.rotate)
        : 0;

      const z = el.dataset.z !== ""
        ? Number(el.dataset.z)
        : 20 + i;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${rotation}deg)`;
      el.style.zIndex = z;

      placed.push({
        el,
        rect: makeRect(
          x,
          y,
          cardWidth,
          cardHeight
        )
      });
    });

    /*
     * おまかせ写真
     */
    autoCards.forEach((el, i) => {
      const w = Number(el.dataset.width) ||
        (isMobile() ? 52 : 20);

      el.style.setProperty("--w", `${w}vw`);

      const cardWidth = el.offsetWidth;
      const cardHeight = el.offsetHeight;

      const marginX = isMobile() ? 4 : 4;
      const marginY = isMobile() ? 8 : 8;

      const minX =
        window.innerWidth * marginX / 100;

      const maxX =
        Math.max(
          minX,
          window.innerWidth -
          cardWidth -
          window.innerWidth * marginX / 100
        );

      const minY =
        pageTop +
        pageHeight * marginY / 100;

      const maxY =
        Math.max(
          minY,
          pageTop +
          pageHeight -
          cardHeight -
          pageHeight * marginY / 100
        );

      let best = null;

      /*
       * できるだけ「空いている場所」を探す
       */
      for (let attempt = 0; attempt < 180; attempt++) {
        const x = rand(minX, maxX);
        const y = rand(minY, maxY);

        const rotation = rand(
          isMobile() ? -4 : -6,
          isMobile() ? 4 : 6
        );

        const rect = makeRect(
          x,
          y,
          cardWidth,
          cardHeight
        );

        let worstOverlap = 0;

        placed.forEach(other => {
          worstOverlap = Math.max(
            worstOverlap,
            overlapRatio(rect, other.rect)
          );
        });

        /*
         * 30％以下なら即採用
         */
        if (worstOverlap <= 0.30) {
          best = {
            x,
            y,
            rotation,
            rect,
            score: worstOverlap
          };
          break;
        }

        /*
         * それ以上なら、
         * 一番重なりの少ない候補を記録
         */
        if (!best || worstOverlap < best.score) {
          best = {
            x,
            y,
            rotation,
            rect,
            score: worstOverlap
          };
        }
      }

      el.style.left = `${best.x}px`;
      el.style.top = `${best.y}px`;
      el.style.transform = `rotate(${best.rotation}deg)`;
      el.style.zIndex = String(10 + i);

      placed.push({
        el,
        rect: best.rect
      });
    });
  }

  /*
   * 全写真をページ単位で配置
   */
  function place() {
    const perPage = cardsPerPage();
    const pageHeight = window.innerHeight;
    const pageCount = Math.ceil(cards.length / perPage);

    stage.style.minHeight =
      `${pageCount * pageHeight}px`;

    cards.forEach(card => {
      card.style.display = "";
    });

    for (let page = 0; page < pageCount; page++) {
      const start = page * perPage;
      const end = Math.min(
        start + perPage,
        cards.length
      );

      placePage(
        cards.slice(start, end),
        page,
        pageHeight
      );
    }
  }

  /*
   * 写真を閉じる
   */
  document.querySelectorAll(".window-close").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest(".window-card");

      if (card) {
        card.classList.toggle("is-closed");
      }
    });
  });

  /*
   * 左下の番号
   */
  document.querySelectorAll("[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.target);
      const card = cards[index];

      if (!card) return;

      card.classList.remove("is-closed");

      card.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  });

  /*
   * Shuffle
   */
  document.querySelector("[data-shuffle]")?.addEventListener(
    "click",
    place
  );

  /*
   * 画面サイズ変更
   */
  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      place();
    }, 200);
  });

  /*
   * 画像読み込み後に配置
   */
  const images = [
    ...document.querySelectorAll(".window-card img")
  ];

  Promise.all(
    images.map(img => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise(resolve => {
        img.addEventListener(
          "load",
          resolve,
          { once: true }
        );

        img.addEventListener(
          "error",
          resolve,
          { once: true }
        );
      });
    })
  ).then(place);
})();
