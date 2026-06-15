/* ─── 상수 ───────────────────────────────────────────────────────────────── */
const TOTAL_PAGES = 166;

const TOC = [
  { title: '표지',         page: 1   },
  { title: '프롤로그',     page: 9   },
  { title: '사진과 글',   page: 15  },
  { title: '작품과 글',   page: 37  },
  { title: '글 다시 쓰기', page: 47  },
  { title: '하루 글쓰기', page: 57  },
  { title: '에필로그',     page: 161 },
];

/* ─── 페이지 파일명 생성 ──────────────────────────────────────────────────── */
function pageFile(n) {
  return `images/page-${String(n).padStart(3, '0')}.jpg`;
}

/* ─── 책 크기 계산 (뷰포트 기준) ─────────────────────────────────────────── */
function calcBookSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isPortrait = vw < 700;

  const PAGE_RATIO = 1182 / 886; // height / width

  if (isPortrait) {
    // 모바일: 한 페이지
    const w = Math.min(vw * 0.88, 380);
    return { w, h: Math.round(w * PAGE_RATIO) };
  } else {
    // 데스크탑: 두 페이지 펼침
    const maxH = Math.min(vh - 260, 680);
    const maxW = Math.min(vw - 80, 1000);
    const w = Math.min(Math.round(maxH / PAGE_RATIO), maxW / 2);
    const h = Math.round(w * PAGE_RATIO);
    return { w, h };
  }
}

/* ─── 초기화 ─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const flipbookEl = document.getElementById('flipbook');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const pageInfo   = document.getElementById('pageInfo');
  const loading    = document.getElementById('loading');
  const tocBtn     = document.getElementById('tocBtn');
  const tocModal   = document.getElementById('tocModal');
  const tocClose   = document.getElementById('tocClose');
  const tocList    = document.getElementById('tocList');

  /* 페이지 DOM 생성 */
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const div = document.createElement('div');
    div.className = 'page';
    const img = document.createElement('img');
    img.src = pageFile(i);
    img.alt = `${i}페이지`;
    // 첫 12페이지만 즉시 로드, 나머지 지연 로드
    if (i > 12) img.loading = 'lazy';
    div.appendChild(img);
    flipbookEl.appendChild(div);
  }

  /* 책 크기 */
  const { w, h } = calcBookSize();

  /* StPageFlip 초기화 */
  const pageFlip = new St.PageFlip(flipbookEl, {
    width:             w,
    height:            h,
    size:              'fixed',
    drawShadow:        true,
    flippingTime:      700,
    usePortrait:       window.innerWidth < 700,
    startZIndex:       0,
    autoSize:          true,
    maxShadowOpacity:  0.6,
    showCover:         true,
    mobileScrollSupport: false,
    swipeDistance:     30,
    clickEventForward: true,
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));

  /* ─── 로딩 해제 ─────────────────────────────────────────────────────────── */
  pageFlip.on('init', () => {
    updateInfo(0);
    setTimeout(() => {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 700);
    }, 300);
  });

  /* ─── 페이지 정보 업데이트 ───────────────────────────────────────────────── */
  function updateInfo(idx) {
    const current = idx + 1;
    pageInfo.textContent = `${current} / ${TOTAL_PAGES}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx >= TOTAL_PAGES - 1;
  }

  pageFlip.on('flip', (e) => updateInfo(e.data));

  /* ─── 버튼 이벤트 ────────────────────────────────────────────────────────── */
  prevBtn.addEventListener('click', () => pageFlip.flipPrev('top'));
  nextBtn.addEventListener('click', () => pageFlip.flipNext('top'));

  /* ─── 키보드 ─────────────────────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   pageFlip.flipPrev('top');
    if (e.key === 'ArrowRight' || e.key === 'PageDown') pageFlip.flipNext('top');
    if (e.key === 'Escape') closeToc();
  });

  /* ─── 차례 ──────────────────────────────────────────────────────────────── */
  TOC.forEach(({ title, page }) => {
    const item = document.createElement('div');
    item.className = 'toc-item';
    item.innerHTML = `<span>${title}</span><span class="toc-item-page">${page}</span>`;
    item.addEventListener('click', () => {
      pageFlip.flip(page - 1, 'top');
      closeToc();
    });
    tocList.appendChild(item);
  });

  function openToc()  { tocModal.classList.add('open'); }
  function closeToc() { tocModal.classList.remove('open'); }

  tocBtn.addEventListener('click', openToc);
  tocClose.addEventListener('click', closeToc);
  tocModal.addEventListener('click', (e) => {
    if (e.target === tocModal) closeToc();
  });

  /* ─── 반응형 리사이즈 ───────────────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const { w: nw, h: nh } = calcBookSize();
      pageFlip.updateSettings({ width: nw, height: nh });
      pageFlip.update();
    }, 200);
  });
});
