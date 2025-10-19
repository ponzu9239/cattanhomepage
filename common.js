/**
 * 共通ヘッダーとフッターを読み込む
 * @param {'user' | 'admin'} type - ヘッダーの種類 ('user' または 'admin')
 */
async function setupHeader(type = 'user') {
  const headerContainer = document.querySelector('header');
  const footerContainer = document.querySelector('footer');

  if (!headerContainer) return;

  // ヘッダーHTMLのファイル名を決定
  const headerFile =
    type === 'admin' ? 'header-admin.html' : 'header-user.html';

  // ヘッダーを読み込む
  try {
    const response = await fetch(headerFile);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const html = await response.text();
    headerContainer.innerHTML = html;
  } catch (e) {
    console.error('ヘッダー読み込み失敗:', e);
  }

  // フッターを読み込む（任意）
  if (footerContainer) {
    try {
      const response = await fetch('footer.html');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const html = await response.text();
      footerContainer.innerHTML = html;
    } catch (e) {
      console.warn('フッター読み込み失敗（footer.htmlが存在しないかも）');
    }
  }

  // ハンバーガーメニューの動作設定
  initializeHamburgerMenu();
}

/**
 * ハンバーガーメニューの開閉動作を設定
 */
function initializeHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('show');
  });
}

/**
 * ページ全体の共通初期設定（必要に応じて他の機能を追加）
 */
function setupCommonElements() {
  initializeHamburgerMenu();
  // ここに他の共通処理を追加してOK（例：テーマ切り替えなど）
}

/**
 * ページ読み込み時に共通CSSを適用
 */
function applyCommonCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'style.css'; // 全ページ共通のCSSファイル
  document.head.appendChild(link);
}

// DOM読み込み後にCSS適用（ヘッダーより先に読み込む）
document.addEventListener('DOMContentLoaded', () => {
  applyCommonCSS();
});