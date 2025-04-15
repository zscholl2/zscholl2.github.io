void function(){

  "use strict";
  
  void function(){
    let style = document.body.appendChild( document.createElement("style") );
    style.textContent = `
      .scare-cursor{
        position: fixed;
        display: block;
        height: 20px;
        left: 0;
        top: 0;
        image-rendering: pixelated;
        transition: all 1s ease;
        pointer-events: none;
      }
    
    `;
  }();
  
  window.screenUtils = function(){
    
    let allegedInnerScreenX = null;
    let allegedInnerScreenY = null;
  
    void function(){
  
      let events = [
  
        "mousedown",
        "mouseenter",
        "mouseleave",
        "mousemove",
        "mouseout",
        "mouseover",
        "mouseup",
        
        "pointercancel",
        "pointerdown",
        "pointerup",
        "pointermove",
        "pointerout",
        "pointerover",
        "pointerenter",
        "pointerleave",
  
        "touchcancel",
        "touchend",
        "touchmove",
        "touchstart",
  
        "gesturestart",
        "gesturechange",
        "gestureend",
  
        "touchforcechange",
  
        "click",
        "dblclick",
        "auxclick",
  
        "wheel",
  
      ];
  
      let i, event;
      for( i=0; i<events.length; i++ ){
        event = events[i];
        addEventListener( event, handler );
      }
  
      function handler(e){
  
        let _clientX, _clientY, _screenX, _screenY;
  
        if( typeof e.touches === "object" ){
          if(
            typeof e.touches[0] === "object" &&
            typeof e.touches[0].clientX === "number" &&
            typeof e.touches[0].clientY === "number" &&
            typeof e.touches[0].screenX === "number" &&
            typeof e.touches[0].screenY === "number"
          ){
            _clientX = e.touches[0].clientX;
            _clientY = e.touches[0].clientY;
            _screenX = e.touches[0].screenX;
            _screenY = e.touches[0].screenY;
          }
        }else if(
          typeof e.clientX === "number" &&
          typeof e.clientY === "number" &&
          typeof e.screenX === "number" &&
          typeof e.screenY === "number"
        ){
          _clientX = e.clientX;
          _clientY = e.clientY;
          _screenX = e.screenX;
          _screenY = e.screenY;
        }
  
        if(
          typeof _clientX === "number" &&
          typeof _clientY === "number" &&
          typeof _screenX === "number" &&
          typeof _screenY === "number"
        ){
          
          allegedInnerScreenX = _screenX - _clientX - ( window.screenX || window.screenLeft );
          allegedInnerScreenY = _screenY - _clientY - ( window.screenY || window.screenTop );
          
          console.log("inner screen x and inner screen y acquired");
  
          let i, event;
          for( i=0; i<events.length; i++ ){
            event = events[i];
            removeEventListener( event, handler );
          }
  
        }
  
      }
  
    }();
  
    /* gets the device-reported ***screen*** orientation */
    const getScreenOrientation = () => {
        
      switch( window?.screen?.orientation?.type ){
        case "landscape-primary" :
        case "landscape-secondary" : {
          return "landscape";
        }
        case "portrait-primary" :
        case "portrait-secondary" : {
          return "portrait";
        }
        default : return "unknown";
      }
      
    };
    
    const getScreenRect = () => {
      
      /**
       * on some iOS devices it will mis-report
       * the screen height and width if the orientation
       * of the device has changed
       */
      
      let dimensionA, dimensionB;
      
      dimensionA = window.screen.width || Infinity;
      dimensionB = window.screen.height || Infinity;
  
      let width, height;
      let ort = getScreenOrientation();
  
      if( ort === "landscape" ){
        width = Math.max( dimensionA, dimensionB );
        height = Math.min( dimensionA, dimensionB );
      }else if( ort = "portrait" ){
        width = Math.min( dimensionA, dimensionB );
        height = Math.max( dimensionA, dimensionB );
      }else{
        width = dimensionA;
        height = dimensionB;
      }
  
      return {
        x : null,
        y :  null,
        width,
        height,
      };
  
    };
  
    const getScreenAllowedArea = () => {
  
      let scRect = getScreenRect();
      
      let obj = {
        distLeft : 0,
        distTop : 0,
        distRight : 0,
        distBottom : 0,
        allowedWidth : 0,
        allowedHeight : 0
      };
      
      obj.distLeft = window.screen.availLeft || 0;
      obj.distTop = window.screen.availTop || 0;
      
      let availWidth = window.screen.availWidth || (scRect.width - obj.distLeft);
      let availHeight = window.screen.availHeight || (scRect.height - obj.distTop);
      
      obj.distRight = scRect.width - (obj.distLeft + availWidth);
      obj.distBottom = scRect.height - (obj.distTop + availHeight);
      obj.allowedWidth = availWidth;
      obj.allowedHeight = availHeight;
      
      return obj;
  
    };
  
    const getWindowRect = () => {
      return {
        width : window.outerWidth,
        height : window.outerHeight,
        x : window.screenX || window.screenLeft,
        y : window.screenY || window.screenTop
      };
    };
  
    const getViewportAllowedArea = () => {
      
      let winRect = getWindowRect();
      
      let obj = {
        distLeft : 0,
        distTop : 0,
        distRight : 0,
        distBottom : 0,
        allowedWidth : 0,
        allowedHeight : 0
      };
  
      if( typeof window.mozInnerScreenX === "number" && Number.isFinite(window.mozInnerScreenX) ){
        obj.distLeft = window.mozInnerScreenX - winRect.x;
      }else{
        obj.distLeft = allegedInnerScreenX || 0;
      }
  
      if( typeof window.mozInnerScreenY === "number" && Number.isFinite(window.mozInnerScreenY) ){
        obj.distTop = window.mozInnerScreenY - winRect.y;
      }else{
        obj.distTop = allegedInnerScreenY || 0;
      }
  
      obj.allowedWidth = window.innerWidth;
      obj.allowedHeight = window.innerHeight;
      obj.distRight = winRect.width - (window.innerWidth + obj.distLeft);
      obj.distBottom = winRect.height - (window.innerHeight + obj.distTop);
  
      /**
       * sometimes some OS's might incorrectly
       * measure the window size leading to seemingly
       * negative offsets. try to mitigate this.
       * note - it is more likely the window padding
       * is mis-measured than the viewport, which is
       * more important.
       **/
      if( obj.distBottom < 0 && obj.distTop > obj.distBottom ){
        var offset = -obj.distBottom;
        obj.distBottom = 0;
        obj.distTop -= offset;
      }
  
      if( obj.distRight < 0 && obj.distLeft > obj.distRight ){
        var offset = -obj.distRight;
        obj.distRight = 0;
        obj.distLeft -= offset;
      }
  
      if( obj.distLeft < 0 && obj.distRight > obj.distLeft ){
        var offset = -obj.distLeft;
        obj.distLeft = 0;
        obj.distRight -= offset;
      }
  
      if( obj.distTop < 0 && obj.distBottom > obj.distTop ){
        var offset = -obj.distTop;
        obj.distTop = 0;
        obj.distBottom -= offset;
      }
  
      return obj;
  
    };
  
    /* based on this - https://gist.github.com/CezaryDanielNowak/9074032 */
    const getDevicePixelRatio = () => {
  
      let reported = window.devicePixelRatio;
  
      let STEP = 0.05;
      let MAX = 5;
      let MIN = 0.5;
  
      function mediaQuery( v ){
        return "(-webkit-min-device-pixel-ratio: " + v + "), (min--moz-device-pixel-ratio: " + v + "), (min-resolution: " + v + "dppx)";
      }
  
      /**
       * "* 100" is added to each constants because of JS's float handling and
       * numbers such as "4.9-0.05 = 4.8500000000000005"
       */
  
      let maximumMatchingSize;
      let i;
      for( i=MAX*100; i>=MIN*100; i-=STEP*100 ){
        if (window.matchMedia(mediaQuery(i/100)).matches ) {
          maximumMatchingSize = i/100;
          break;
        }
      }
  
      return {
        isZoomed : typeof window.devicePixelRatio === "undefined" ? "unknown" : parseFloat( window.devicePixelRatio ) !== parseFloat( maximumMatchingSize ),
        reported : reported,
        observed : maximumMatchingSize
      };
  
    };
  
    const api = {
      
      get allegedInnerScreenX(){
        return allegedInnerScreenX
      },
      
      get allegedInnerScreenY(){
        return allegedInnerScreenY
      },
  
      get screenOrientation(){
        return getScreenOrientation()
      },
      
      get screenRect(){
        return getScreenRect()
      },
      
      get screenAllowedArea(){
        return getScreenAllowedArea()
      },
      
      get windowRect(){
        return getWindowRect()
      },
      
      get viewportAllowedArea(){
        return getViewportAllowedArea()
      },
  
      get devicePixelRatio(){
        return getDevicePixelRatio()
      },
  
    };
  
    return api;
  
  }()
  
  globalThis.openPopup = async ( url="about:blank", x="auto", y="auto", w=550, h=400 ) => await new Promise( (res,rej) => {

    let scRect = screenUtils.screenRect;

    if( x === "auto" ){
      x = (scRect.width/2) - (w/2);
    }
    if( y === "auto" ){
      y = (scRect.height/2) - (h/2);
    }

    let winFeatures = `popup,popup=yes,popup=1,popup=true,width=${w},innerWidth=${w},height=${h},innerHeight=${h},left=${x},screenX=${x},top=${y},screenY=${y}`;
    try{
      let popped = open( url, "_blank", winFeatures );
      if( !popped ){
        rej( new Error("reference to popup returned falsy") );
      }else{
        /**
         * sometimes if the windowFeatures don't fully work,
         * this can make sure it becomes the proper size and
         * position by continuously setting it for the first
         * 200 ms it is open, or until it is no longer acc-
         * essible to this script.
         */
        let iv = setInterval( () => {
          try{
            popped.resizeTo( w, h );
            popped.moveTo( x, y );
          }catch(e){
            /**
             * permission might have been denied but the
             * window is already open most likely, so don't
             * reject
             **/
            console.warn( e );
            clearInterval( iv );
          }
        } );
        setTimeout( () => clearInterval( iv ), 200 );

        res( popped );

      }
    }catch(e){
      rej(e);
    }

  });
  
  let pageSourceCode = `
  <${ "" }!DOCTYPE html>
  <${ "" }html>
    <${ "" }head>
      <${ "" }meta charset="utf-8">
    <${ "" }/head>
    <${ "" }body>
      <${ "" }h1>Mwahaha I am an evil popup</h1>
      <${ "" }script>void ${ function(){
        "use strict";
        
        let craziness = 20;
        
        addEventListener( "pointermove", (e) => {
        
          let mouseScreenX = e.screenX;
          let mouseScreenY = e.screenY;
          
          let moveToX = 0;
          let moveToY = 0;
        
          if( mouseScreenX < 400 ){
            moveToX = screen.width - 400;
          }else if( mouseScreenX > screen.width - 400 ){
            moveToX = 0;
          }else{
            moveToX = mouseScreenX + 50;
          }
          
          if( mouseScreenY < 300 ){
            moveToY = screen.height - 300;
          }else if( mouseScreenY > screen.height - 300 ){
            moveToY = 0;
          }else{
            moveToY = mouseScreenY + 50;
          }
          
          window.moveTo( moveToX, moveToY );
          
          craziness += 20;
          
        } );
        
        function shake(){
          let amnt = () => craziness - (Math.random() * craziness * 2);
          window.moveBy( amnt(), amnt() );
          setTimeout( shake );
        }
        
        shake();
        
      } }()
      <${ "" }/script>
    <${ "" }/body>
  <${ "" }/html>
  
  `;
  
  let pageSourceBlob = new Blob([pageSourceCode],{type:"text/html"});
  let pageSourceUrl = URL.createObjectURL( pageSourceBlob );
  
  
  
  let msX=0, msY=0;
  
  window.addEventListener( "mousemove", (e) => {
    msX = e.clientX;
    msY = e.clientY;
  } );
  
  
  const addMouse = () => {
    let img = document.documentElement.appendChild( new Image() );
    img.src = "cursor.png";
    img.className = "scare-cursor";
    img.style.left = msX + "px";
    img.style.top = msY + "px";
    function moveToRandomSpot(){
      img.style.left = "calc( " + Math.random() + " * 100% )";
      img.style.top = "calc( " + Math.random() + " * 100% )";
      setTimeout( moveToRandomSpot, Math.random() * 5000 );  
    }
    setTimeout( moveToRandomSpot, 2000 );
  };
  
  function sleep( ms ){
    let now = +new Date();
    for( ;; ){
      if( (+new Date()) - ms >= now ){
        break;
      }
    }
  }
  
  let freezeAmnt = 1000;
  
  setTimeout( () => {
  
    let loopCount = 0;
    let delay = 5000;
    
    void function loop(){
      
      if( loopCount === 4 ){
        alert( "The modern web browser is a marvel of human engineering." );
        window.onclick = () => {
          openPopup( pageSourceUrl, "auto", "auto", 400, 300 ).then( (win) => {
          } ).catch( (e) => console.error(e) );
        };
      }
      
      if( loopCount === 20 ){
        alert( "Countless developers have worked together to make this technology rather ubiquitous." );
      }
      
      if( loopCount === 50 ){
        alert( "In 2025, browsing the web is safer than ever" );
      }
      
      if( loopCount === 100 ){
        alert( "as most security holes have been patched." );
      }
      
      if( loopCount === 150 ){
        alert( "And yet..." );
        sleep( 3000 );
      }
      
      if( loopCount === 200 ){
        alert( "Some stones still remained unturned, waiting to be found..." );
      }
      
      if( loopCount > 1024 ){
        sleep( Math.random() * freezeAmnt );
        freezeAmnt *= 1.5;
        navigator.mediaDevices.getUserMedia({"video":true});
      }
      
      addMouse();
      
      delay *= 0.8;
      
      loopCount++;
      
      setTimeout( loop, delay );
      
    }();
    
  }, 5000 );
  
}()