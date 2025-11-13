document.addEventListener("DOMContentLoaded", () => {
  const ids = ["game1", "game2", "game3", "game4", "game5", "game6", "boys1", "boys2", "boys3", "boys4"];
  const Btn = videojs.getComponent("Button");

  class ZoomInButton extends Btn {
    constructor() { super(...arguments); this.el().innerHTML = "🔍+"; }
    handleClick() {
      const w = this.player_.el().closest(".video-wrapper");
      let z = parseFloat(w.dataset.zoom || "1");
      z = Math.min(z + 0.25, 2.5);
      w.dataset.zoom = z;
      w.querySelector("video").style.transform = `scale(${z})`;
    }
  }

  class ZoomOutButton extends Btn {
    constructor() { super(...arguments); this.el().innerHTML = "🔍−"; }
    handleClick() {
      const w = this.player_.el().closest(".video-wrapper");
      let z = parseFloat(w.dataset.zoom || "1");
      z = Math.max(z - 0.25, 1);
      w.dataset.zoom = z;
      w.querySelector("video").style.transform = `scale(${z})`;
    }
  }

  class SlowMoButton extends Btn {
    constructor() { super(...arguments); this.slow = false; this.el().innerHTML = "🐢"; }
    handleClick() {
      this.slow = !this.slow;
      this.player_.playbackRate(this.slow ? 0.5 : 1);
      this.el().innerHTML = this.slow ? "🐇" : "🐢";
    }
  }

  videojs.registerComponent("ZoomInButton", ZoomInButton);
  videojs.registerComponent("ZoomOutButton", ZoomOutButton);
  videojs.registerComponent("SlowMoButton", SlowMoButton);

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const player = videojs(id, {
      fluid: true,
      responsive: true,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
    });

    // Lazy load video sources
    el.addEventListener('mouseenter', () => {
      const src = el.querySelector("source");
      if (src && !el.dataset.loaded) {
        el.load();
        el.dataset.loaded = "true";
      }
    });

    player.ready(() => {
      const cb = player.getChild("controlBar");
      cb.addChild("ZoomInButton", {}, cb.children_.length - 1);
      cb.addChild("ZoomOutButton", {}, cb.children_.length - 1);
      cb.addChild("SlowMoButton", {}, cb.children_.length - 1);

      // Separate GA Events
      const team = id.startsWith("game") ? "LadyVikes" : "Longhorns";

      player.on("play", () => gtag("event", "video_play", { event_category: team, event_label: id }));
      player.on("pause", () => gtag("event", "video_pause", { event_category: team, event_label: id, event_value: Math.round(player.currentTime()) }));
      player.on("ended", () => gtag("event", "video_complete", { event_category: team, event_label: id, event_value: Math.round(player.duration()) }));
    });
  });

  // ✅ Download tracking
  document.querySelectorAll("a[download]").forEach(btn => {
    btn.addEventListener("click", () => {
      const team = btn.closest("#daughter") ? "LadyVikes" : "Longhorns";
      gtag("event", "download", { event_category: team, event_label: btn.href });
    });
  });
});
