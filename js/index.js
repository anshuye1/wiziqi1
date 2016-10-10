$(function () {
    var canvas = $('#canvas').get(0);
    var ctx = $('#canvas').get(0).getContext('2d');
    var ROW = 15;
    var width = canvas.width;
    var flag = true;
    var blocks = {};
    var off = width / ROW;//间距
    var ai=false;
    var blank ={};
    for(var i=0 ;i<15;i++){
        for(var j=0;j<15;j++){
            blank[i+'_'+j]=true;
        }
    }
    console.log(blank);
    //0.5用来消除间距
    //转｛position:x,position:y｝
    function o2k(position) {
        return position.x + '_' + position.y;
    }
    //转｛x:x,y:y｝
    function k2o(key) {
        var arr = key.split('_');
        return {x: parseInt(arr[0]) , y: parseInt(arr[1])};
    }
    //画线
    function draw() {
        ///////////////////////////////////画线//////////////////////////////////////////
        function makeLine() {
            //横线
            for (var i = 0; i < ROW; i++) {
                ctx.beginPath();
                ctx.moveTo(off / 2 + 0.5, off / 2 + 0.5 + i * off);
                ctx.lineTo((ROW - 0.5) * off + 0.5, off / 2 + 0.5 + i * off);
                ctx.stroke();
                ctx.closePath();
            }
            //竖线
            for (var i = 0; i < ROW; i++) {
                ctx.beginPath();
                ctx.moveTo(off / 2 + 0.5 + i * off, off / 2 + 0.5);
                ctx.lineTo(off / 2 + 0.5 + i * off, (ROW - 0.5) * off + 0.5);
                ctx.stroke();
                ctx.closePath();
            }
        }

        makeLine();
        ////////////////////////////////////画圆//////////////////////////////////////////
        function makeCircle(x, y, r) {
            ctx.beginPath();
            ctx.arc((x + 0.5) * off + 0.5, (y + 0.5) * off + 0.5, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }

        makeCircle(3, 3, 2);
        makeCircle(3, 11, 2);
        makeCircle(7, 7, 3);
        makeCircle(11, 3, 2);
        makeCircle(11, 11, 2);
    }draw();
    //落子
    function drawCircle(position, color) {
        $('.audio2').get(0).play();
        ctx.save();
        ctx.beginPath();
        ctx.translate((position.x + 0.5) * off + 0.5, (position.y + 0.5) * off + 0.5);
        ctx.arc(0, 0, 15, 0, 2 * Math.PI);
        var radgrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 15);
        radgrad.addColorStop(0, '#ccc');
        radgrad.addColorStop(1, '#000');
        var radgrad2 = ctx.createRadialGradient(0, 0, 3, 0, 0, 15);
        radgrad2.addColorStop(0, '#fff');
        radgrad2.addColorStop(1, '#ccc');
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        if (color === "black") {
            ctx.fillStyle = radgrad
        } else {
            ctx.fillStyle = radgrad2
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        //放表
        blocks[o2k(position)] = color;
        delete blank[o2k(position)];
    }
    //选择
    function check(pos, color) {
        var table = {};
        var num = 1;
        var num1 = 1;
        var num2 = 1;
        var num3 = 1;
        for (var i in blocks) {
            if (blocks[i] === color) {
                table[i] = true;
            }
        }
        var tx = pos.x;
        var ty = pos.y;
        /////////////////////////////左右
        while (table[(tx + 1) + '_' + ty]) {
            num++;
            tx++;
        }
        tx = pos.x;
        ty = pos.y;
        while (table[(tx - 1 )+ '_' + ty]) {
            num++;
            tx--;
        }

        /////////////////////////////上下
        while (table[(tx) + '_' + (ty + 1)]) {
            num1++;
            ty++;
        }
        tx = pos.x;
        ty = pos.y;
        while (table[(tx) + '_' + (ty - 1)]) {
            num1++;
            ty--;
        }
        /////////////////////////////右上\下
        while (table[(tx - 1) + '_' + (ty + 1)]) {
            num2++;
            tx--;
            ty++;
        }
        tx = pos.x;
        ty = pos.y;
        while (table[(tx + 1) + '_' + (ty + 1)]) {
            num2++;
            tx++;
            ty--;
        }

        /////////////////////////////左右
        while (table[(tx + 1) + '_' + (ty + 1)]) {
            num3++;
            tx++;
            ty++;
        }
        tx = pos.x;
        ty = pos.y;
        while (table[(tx - 1) + '_' + (ty - 1)]) {
            num3++;
            tx--;
            ty--;
        }
        return Math.max(num,num1,num2,num3)
    }
    //棋谱文本
    function drawText(pos, text,color) {
        ctx.save();
        ctx.font = "20px 微软雅黑";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if(color =='black'){
            ctx.fillStyle= '#fff';
        }else if(color =='white'){
            ctx.fillStyle= '#000';
        }
        ctx.fillText (text,(pos.x+0.5)*off,(pos.y+0.5)*off);
        ctx.restore();
    }
    //棋谱
    function review() {
        var i=1;
        for (var j in blocks) {
            drawText(k2o(j),i,blocks[j]);
            i++;
        }
    }
    //输赢系统
    function handleClick(){
        $(canvas).on('click', function (e) {
            var position = {
                x: Math.round((e.offsetX - off / 2) / off),
                y: Math.round((e.offsetY - off / 2) / off)
            };
            if (blocks[o2k(position)]) {
                return
            }
            if(ai){
                drawCircle(position,'black');
                if (check(position, 'black')>= 5) {
                    alert('黑旗赢');
                    $(canvas).off("click");
                    if (confirm("是否产生棋谱")) {
                        review();
                    }else{
                        return
                    }
                    return
                }
                drawCircle(AI(),'white');
                if (check(AI(), 'white')>=6) {
                    $(canvas).off("click");
                    alert('白旗赢');
                    if (confirm("是否产生棋谱")) {
                        review();
                    } else {
                        return
                    }
                    return;
                }
                return;
            }
            if (flag) {
                drawCircle(position, 'black');
                clearInterval(t);
                t1=setInterval(js1,1000);
                s=60;
                $('.js1').addClass('active');
                $('.js').removeClass('active');
                flag = false;
                } else {
                clearInterval(t1);
                t=setInterval(js,1000);
                s=60;
                $('.js').addClass('active');
                $('.js1').removeClass('active');
                    drawCircle(position, 'white');
                    flag = true;
                }
            if (check(position, 'black')>=5) {
                $(canvas).off("click");
                alert('黑旗赢');
                if (confirm("是否产生棋谱")) {
                    review()
                } else {
                    return
                }
            }
            if (check(position, 'white')>=5) {
                $(canvas).off("click");
                alert('白旗赢');
                if (confirm("是否产生棋谱")) {
                    review()
                } else {
                    return
                }
            }
        });

    }handleClick();
    //AI
    function AI(){
        var max1=-Infinity;
        var max2=-Infinity;
        var pos1;
        var pos2;
        for(var i in blank){
            var score1=check(k2o(i),'black');
            var score2=check(k2o(i),'white');
            if(score1>max1){
                max1=score1;
                pos1=k2o(i);
            }
            if(score2>max2){
                max2=score2;
                pos2=k2o(i);
            }
        }
        if(max2>=max1){
            return pos2;
        }else{
            return pos1;
        }
    }
    //计时
    var s=60;
    var t,t1;
    function js() {
        s--;
        if(s===0){
            clearInterval(t);
            s=60;
        }
        if(s>=10){
            $('.js').text("00:"+s);
        }else{
            $('.js').text("00:0"+s);
        }
    }
    function js1() {
        s--;
        if(s===0){
            clearInterval(t);
            clearInterval(t1);
            s=60;
            return;
        }
        if(s>=10){
            $('.js1').text("00:"+s);
        }else{
            $('.js1').text("00:0"+s);
        }
    }
    //重新开始
    function restart(){
        ctx.clearRect(0,0,width,width);
        blocks={};
        blank={};
        draw();
        flag=true;
        s=60;
        clearInterval(t);
        clearInterval(t1);
        $('.js').removeClass('active');
        $('.js1').removeClass('active');
        $(canvas).off('click').on('click', handleClick);
    }
    //////////////////////////////////////////////////////////
    //启动AI 模式选择
    $('.ai').on('click',function(){
        $(this).addClass('active');
        setTimeout(function () {
            $('.ai').removeClass('active')
        },300);
        $('.ai .mos').addClass('active');
    });

    //开始游戏
    $('.zz-box span').on('click',function(){
        $('.zz-box').addClass('active');
        $('.wz').addClass('active');
        $('.zz-box span').addClass('active');
        $('.zz-left').addClass('active');
        $('.zz-right').addClass('active');
        setTimeout(function(){$('.zz-box').css('display','none')},1000);
        $('.audio1').get(0).play();
    });
    //重新开始
    $('.btn1').on('click',function(){
        restart();
        $(this).addClass('active');
        setTimeout(function () {
            $('.btn1').removeClass('active')
        },300);
    });
    //退出游戏
    $('.btn2').on('click',function(){
        restart();
        $(this).addClass('active');
        setTimeout(function () {
            $('.btn2').removeClass('active')
        },300);
        setTimeout(function(){
            $('.zz-box').css('display','block');
        },200);
        $('.zz-box').removeClass('active');
        $('.wz').removeClass('active');
        $('.zz-box span').removeClass('active');
        $('.zz-left').removeClass('active');
        $('.zz-right').removeClass('active');
        $('.audio1').get(0).pause();
    });
    $('.ai .mos').on('click',false);
    $('#ai1').on('click',function(){
        $(this).addClass('active');
        $('#ai0').removeClass('active');
        $('.ai .mos').removeClass('active');
        $('.btn-box h2').addClass('active').text("--人机对战--");
        setTimeout(function(){
            $('.btn-box h2').removeClass('active');
        },500);
        ai=true;
    });
    $('#ai0').addClass('active');
    $('#ai0').on('click',function(){
        $(this).addClass('active');
        $('#ai1').removeClass('active');
        $('.ai .mos').removeClass('active');
        $('.btn-box h2').addClass('active').text("--双人博弈--");
        setTimeout(function(){
            $('.btn-box h2').removeClass('active');
        },500);
        ai=false;
    })
    //yl//////////////////////////////////////
    var audio1=$('.audio1').get(0);
    var flagAudio=true;
    $('.jy').on('click',function(){
        if(flagAudio){
            $(this).addClass('active');
            audio1.volume=0;
            flagAudio=false;
        }else{
            $(this).removeClass('active');
            audio1.volume=1;
            flagAudio=true;
        }
    });
});

