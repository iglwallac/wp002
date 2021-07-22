<script>
  (function (w, o) {
    try {
      if (!(w.location.search || '').includes('smartling=true')) {
        return
      }
      var h = document.getElementsByTagName('head')[0];
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = 1;
      s.crossorigin = 'anonymous';
      s.src = '//d2c7xlmseob604.cloudfront.net/tracker.min.js';
      s.onload = function () {
        w.SmartlingContextTracker.init({ orgId: o });
      };
      h.insertBefore(s, h.firstChild);
    } catch (ex) {
    }
  })(window, 'WueJqhpVO+TCtcnSnl2zHw')
</script>
