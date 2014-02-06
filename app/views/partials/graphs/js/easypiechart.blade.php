{{ HTML::script('js/easy.pie.chart.js') }}
<script type="text/javascript">
$(function() {
    $('.chart').easyPieChart({
        animate: 2000,
        barColor:'#b85e80',
        size:30,
        lineWidth:5
    });
    $('.explorerChart').easyPieChart({
        animate: 2000,
        barColor:'#36d0ff',
        size:90,
        lineWidth:5
    });
});
</script>