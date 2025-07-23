    // Firebase初期化設定
    const firebaseConfig = {
      apiKey: "AIzaSyBWaCw2nAEh6FbYbteNk_fBSqPBTZ_UhC8",
      authDomain: "catiffanygame.firebaseapp.com",
      databaseURL: "https://catiffanygame-default-rtdb.firebaseio.com",
      projectId: "catiffanygame",
      storageBucket: "catiffanygame.appspot.com",
      messagingSenderId: "166871605809",
      appId: "1:166871605809:web:1fe6e874fa06005ec46b10",
      measurementId: "G-ZNGEZZWMTP"
    };
    firebase.initializeApp(firebaseConfig);

    const dbRef = firebase.database().ref("/cattan");

    // 🎉 当選者の名前を読み込んで表示（← ここを外に出す）
    const winnerEl = document.getElementById("winnerName");
    const winnerRef = firebase.database().ref("/roulette/winner");

    winnerRef.on("value", (snapshot) => {
      const winners = snapshot.val();
      if (winners) {
        const keys = Object.keys(winners);
        if (keys.length > 0) {
          keys.sort();
          const latestWinner = winners[keys[keys.length - 1]];
          winnerEl.textContent = `🎊 ${latestWinner} 🎊`;
          updateProbabilityBar(latestWinner);


          // アニメーション付与
          winnerEl.classList.remove("animate-winner"); // 一旦リセット
          void winnerEl.offsetWidth; // リセット用の強制再描画トリガー
          winnerEl.classList.add("animate-winner");

          return;
        }
      }
      winnerEl.textContent = "まだ抽選が行われていません。";
    });

    // 🔽 これはそのままでOK
    dbRef.on("value", (snapshot) => {
      const data = snapshot.val() || {};

      // 参加コード表示
      const code = data.code || "現在、参加型カスタムは行われておりません。";
      const codeEl = document.getElementById("participantCodeDisplay");
      codeEl.textContent = code;

      // 配信動画表示
      const url = data.stream || "現在、配信は行われていません。";
      const container = document.getElementById("videoContainer");

      if (!url || url === "現在、配信は行われていません。") {
        container.textContent = "現在、配信は行われていません。";
        return;
      }

      let iframeSrc = "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        const ytMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
          videoId = ytMatch[1];
        } else {
          const liveMatch = url.match(/live\/([a-zA-Z0-9_-]+)/);
          if (liveMatch) videoId = liveMatch[1];
        }
        if (videoId) {
          iframeSrc = `https://www.youtube.com/embed/${videoId}`;
        } else {
          iframeSrc = url;
        }
      } else if (url.includes("twitch.tv")) {
        const twitchMatch = url.match(/twitch.tv\/([^\/]+)/);
        const channelName = twitchMatch ? twitchMatch[1] : null;
        if (channelName) {
          const parentDomain = location.hostname;
          iframeSrc = `https://player.twitch.tv/?channel=${channelName}&parent=${parentDomain}`;
        } else {
          iframeSrc = url;
        }
      } else {
        iframeSrc = url;
      }

      container.innerHTML = `<iframe src="${iframeSrc}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
    });

    // 🎉 ルーレットの名前表示エリア（当選者の上に表示）
    const rouletteDisplayEl = document.createElement("div");
    rouletteDisplayEl.id = "rouletteDisplay";
    rouletteDisplayEl.style.display = "block";
    rouletteDisplayEl.style.width = "10em"; // 固定幅にしてブレ防止
    rouletteDisplayEl.style.textAlign = "center";
    rouletteDisplayEl.style.whiteSpace = "nowrap";
    rouletteDisplayEl.style.overflow = "hidden";
    rouletteDisplayEl.style.fontSize = "1.3em";
    rouletteDisplayEl.style.margin = "0 auto";
    rouletteDisplayEl.style.fontWeight = "bold";
    rouletteDisplayEl.style.color = "#007ACC";

    // 挿入先：#winnerName の前
    const winnerNameEl = document.getElementById("winnerName");
    winnerNameEl.insertAdjacentElement("beforebegin", rouletteDisplayEl);

    let spinInterval;

    // 参加者取得
    let participantNames = [];
    const participantsRef = firebase.database().ref("/roulette/participants");
    participantsRef.on("value", (snapshot) => {
      const data = snapshot.val() || {};
      participantNames = Object.values(data);
    });

    // 🎨 全体円グラフを描画（倍率別確率）
    firebase.database().ref("/roulette/participants").on("value", (snapshot) => {
      const participants = Object.values(snapshot.val() || {});
      drawProbabilityPieChart(participants); // ← 上で定義した関数を使うよ！
    });


    // ステータス監視（ルーレットの状態を監視）
    const statusRef = firebase.database().ref("/roulette/status");
    statusRef.on("value", (snapshot) => {
      const status = snapshot.val();

      if (status === "spinning") {
        startRouletteAnimation();
      } else if (status === "stopped") {
        stopRouletteAnimation(); // ← 視聴者側でもちゃんと止める！
      } else {
        // 何か他の値だったら安全のため止めておく
        stopRouletteAnimation();
      }
    });

    function startRouletteAnimation() {
      if (spinInterval || participantNames.length === 0) return;

      let i = 0;
      spinInterval = setInterval(() => {
        const participant = participantNames[i % participantNames.length];
        const name = typeof participant === 'object' ? participant.name : participant;
        rouletteDisplayEl.textContent = `抽選中... ${name}`;
        i++;
      }, 1); // ← アニメ速度はここで調整
    }

    function stopRouletteAnimation() {
      clearInterval(spinInterval);
      spinInterval = null;
      rouletteDisplayEl.textContent = ""; // ← これが表示を消す
    }


    const db = firebase.firestore();
    const chartCtx = document.getElementById('probabilityChart').getContext('2d');
    let chart; // グラフインスタンス保持用

    async function drawProbabilityChart() {
      const snapshot = await db.collection("participants").get();
      const data = {};
      snapshot.forEach(doc => {
        const { name, multiplier } = doc.data();
        data[name] = (data[name] || 0) + (multiplier || 1);
      });

      const labels = Object.keys(data);
      const values = Object.values(data);

      // すでにグラフがあれば破棄
      if (chart) chart.destroy();

      chart = new Chart(chartCtx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: '当選確率',
            data: values,
            backgroundColor: labels.map((_, i) =>
              `hsl(${(i * 360 / labels.length)}, 80%, 70%)`
            ),
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const val = context.raw;
                  const percent = ((val / total) * 100).toFixed(1);
                  return `${context.label}: ${val}倍（${percent}%）`;
                }
              }
            }
          }
        }
      });
    }

    // 初回読み込み＆更新検知
    drawProbabilityChart();
    db.collection("participants").onSnapshot(drawProbabilityChart);


    function updateProbabilityBar(winnerName) {
      firebase.database().ref("/roulette/participants").once("value").then(snapshot => {
        const participantsObj = snapshot.val() || {};
        const participants = Object.values(participantsObj);

        const winner = participants.find(p => {
          if (typeof p === "object") return p.name === winnerName;
          return p === winnerName;
        });

        if (!winner) return;

        const winnerMultiplier = winner.multiplier || 1;
        const total = participants.reduce((sum, u) => {
          return sum + (typeof u === "object" ? (u.multiplier || 1) : 1);
        }, 0);

        const percent = (winnerMultiplier / total) * 100;

        const bar = document.getElementById("probabilityBar");
        const text = document.getElementById("probabilityPercent");

        bar.style.width = `${percent}%`;
        text.textContent = `当選確率: ${percent.toFixed(1)}%`;
      });
    }

    function drawProbabilityPieChart(participants) {
      const ctx = document.getElementById("probabilityPieChart").getContext("2d");

      // 可愛い系ランダム色生成（パステル調）
      const getRandomCuteColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 80%)`;
      };

      const labels = participants.map(p => p.name);
      const values = participants.map(p => p.multiplier || 1);
      const total = values.reduce((a, b) => a + b, 0);
      const backgroundColors = labels.map(() => getRandomCuteColor());

      if (window.pieChart) window.pieChart.destroy(); // 前のグラフ削除

      window.pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const name = context.label;
                  const val = context.raw;
                  const percent = ((val / total) * 100).toFixed(1);
                  return `${name}: ${val}倍（${percent}%）`;
                }
              }
            }
          }
        }
      });
    }


    // ページ読み込み時に状態を確認して適用
    if (localStorage.getItem("mode") === "dark") {
      document.body.classList.add("dark-mode");
    }

    // ダークモード切り替え関数
    function toggleDarkMode() {
      const body = document.body;
      const isDark = body.classList.toggle("dark-mode");

      // 保存
      localStorage.setItem("mode", isDark ? "dark" : "light");
    }