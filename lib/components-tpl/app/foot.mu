    {{# foot.scripts }}{{& foot.scripts }}{{/ foot.scripts }}
    {{# bundles }}<script src="{{& assetsUrl }}{{& . }}"></script>{{/ bundles }}
    {{# assets.main.js }}<script src="{{& assetsUrl }}{{& assets.main.js }}"></script>{{/ assets.main.js }}
    {{# optimizely }}<script src="{{& optimizely }}" async></script>{{/ optimizely }}
    <script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=8cc6f1da-d2b2-4f14-a8ba-9c4ee2616d00" async></script>
  </div>
</body>
</html>
