<script type="text/javascript">
var ScarabQueue = ScarabQueue || [];
(function(id) {
  if (document.getElementById(id)) return;
  var js = document.createElement('script'); js.id = id;
  js.src = '//cdn.scarabresearch.com/js/19C0861C4D902C4F/scarab-v2.js';
  var fs = document.getElementsByTagName('script')[0];
  fs.parentNode.insertBefore(js, fs);
})('scarab-js-api');

{{# config.emarsysTestmode }}
ScarabQueue.push(['testMode']);
{{/ config.emarsysTestmode }}
</script>
