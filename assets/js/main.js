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
   * 2つの矩形がどのくらい重なっているかを計算
   * 0 = 重ならない
   * 1 = 完全に重なる
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
   * 1ページ分の写真を配置する
   */
  function placePage(pageCards, pageIndex, pageHeight) {
    const pageTop = pageIndex * pageHeight;

    const placed = [];

    pageCards.forEach((el, i) => {
      const w = Number(el.dataset.width) || (isMobile() ? 52 : 20);

      el.style.setProperty("--w", `${w}vw`);

      /*
       * いったん画面外に置いてサイズを確定させる
       */
      el.style.left = "0";
      el.style.top = `${pageTop}px`;
      el.style.transform = "rotate(0deg)";
      el.style.zIndex = String(10 + i);

      const cardWidth = el.offsetWidth;
      const cardHeight = el.offsetHeight;

      /*
       * 画面内に収めるための余白
       */
      const marginX = isMobile() ? 4 : 3;
      const marginY = isMobile() ? 8 : 6;

      const maxX =
        Math.max(
          marginX,
          window.innerWidth - cardWidth - (window.innerWidth * marginX / 100)
        );

      const maxY =
        Math.max(
          marginY,
          pageHeight - cardHeight - (pageHeight * marginY / 100)
        );

      let chosen = null;

      /*
       * 最大100回まで候補位置を試す。
       * 重なり30％以下の場所を優先。
       */
      for (let attempt = 0; attempt < 100; attempt++) {
        const x = rand(
          window.innerWidth * marginX / 100,
          maxX
        );

        const y = rand(
          pageTop + pageHeight * marginY / 100,
          pageTop + maxY
        );

        const rotation = rand(
          isMobile() ? -4 : -6,
          isMobile() ? 4 : 6
        );

        const candidate = {
          left: x,
          top: y,
          right: x + cardWidth,
          bottom: y + cardHeight,
          width: cardWidth,
          height: cardHeight
        };

        /*
         * 既に置いた写真との最大重なり率を調べる
         */
        let worstOverlap = 0;

        placed.forEach(other => {
          worstOverlap = Math.max(
            worstOverlap,
            overlapRatio(candidate, other.rect)
          );
        });

        /*
         * 30％以下なら採用
         */
        if (worstOverlap <= 0.30) {
          chosen = {
            x,
            y,
            rotation,
            rect: candidate
          };
          break;
        }

        /*
         * 最後まで見つからなかった場合は、
         * 重なりが一番少ない候補を採用するための保険
         */
        if (!chosen || worstOverlap < chosen.overlap) {
          chosen = {
            x,
            y,
            rotation,
            rect: candidate,
            overlap: worstOverlap
          };
        }
      }

      /*
       * 配置
       */
      el.style.left = `${chosen.x}px`;
      el.style.top = `${chosen.y}px`;
      el.style.transform = `rotate(${chosen.rotation}deg)`;

      placed.push({
        el,
        rect: chosen.rect
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

    stage.style.minHeight = `${pageCount * pageHeight}px`;

    /*
     * いったん全カードを表示
     */
    cards.forEach(card => {
      card.style.display = "";
    });

    for (let page = 0; page < pageCount; page++) {
      const start = page * perPage;
      const end = Math.min(start + perPage, cards.length);

      const pageCards = cards.slice(start, end);

      placePage(
        pageCards,
        page,
        pageHeight
      );
    }
  }

  /*
   * 写真を閉じるボタン
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
   * 左下の番号をクリックしたとき、
   * その写真までスクロール
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
   * ウィンドウサイズ変更時に再配置
   */
  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      place();
    }, 200);
  });

  /*
   * 初回配置
   * 画像の読み込み後にサイズを測る
   */
  const images = [...document.querySelectorAll(".window-card img")];

  Promise.all(
    images.map(img => {
      if (img.complete) return Promise.resolve();

      return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  ).then(place);
})();
