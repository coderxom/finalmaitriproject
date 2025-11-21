// maitri-system.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize button listeners after DOM loads
  document.getElementById('start-btn').addEventListener('click', startMaitriSystem);
  document.getElementById('stop-btn').addEventListener('click', stopMaitriSystem);
  document.getElementById('audio-btn').addEventListener('click', toggleAudio);
});

class MaitriAstronautAssistant {
  drawAudio(dataArray) {
    const canvas = document.getElementById('audio-visualizer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / dataArray.length;
    let x = 0;
    const colors = {
      'happy': '#4caf50',
      'sad': '#2196f3',
      'angry': '#f44336',
      'fear': '#ff9800',
      'surprise': '#9c27b0',
      'neutral': '#607d8b'
    };
    ctx.fillStyle = colors[this.currentEmotion] || '#607d8b';
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
}

  constructor() {
    this.videoStream = null;
    this.audioStream = null;
    this.isMonitoring = false;
    this.emotionInterval = null;
    this.audioContext = null;
    this.analyser = null;

    this.emotions = ['happy','sad','angry','fear','surprise','neutral'];
    this.currentEmotion = 'neutral';
    this.emotionConfidence = 0;
    this.stressLevel = 'low';
    this.audioEnabled = true;
    this.sessionStartTime = null;
  }

  async startMaitriSystem() {
    try {
      this.sessionStartTime = new Date();
      this.updateUI('🔄 Requesting camera & mic access...', 'loading');
      this.updateStatusIndicator('connecting');

      await this.setupMediaDevices();
      this.startEmotionDetection();
      if (this.audioEnabled) this.startAudioAnalysis();

      this.isMonitoring = true;
      this.updateUI('✅ MAITRI online. Monitoring well-being...', 'success');
      this.updateStatusIndicator('online');
      document.getElementById('start-btn').disabled = true;
      document.getElementById('stop-btn').disabled = false;

    } catch (err) {
      this.handleError(err);
    }
  }

  async setupMediaDevices() {
    const md = navigator.mediaDevices;
    const constraints = { video: { facingMode:'user' }, audio:true };

    if (!md || !md.getUserMedia) {
      const legacy = navigator.webkitGetUserMedia||navigator.mozGetUserMedia;
      if (!legacy) throw new Error('getUserMedia not supported');
      this.videoStream = await new Promise((res,rej) =>
        legacy.call(navigator,constraints,res,rej)
      );
    } else {
      this.videoStream = await md.getUserMedia(constraints);
    }
    this.audioStream = this.videoStream;
    const videoEl = document.getElementById('video');
    videoEl.srcObject = this.videoStream;
    await new Promise(r=> videoEl.onloadedmetadata=r);
  }

  startEmotionDetection() {
    this.emotionInterval = setInterval(()=>{
      if (!this.isMonitoring) return;
      this.captureFrameAndDetect();
    },2500);
  }

  captureFrameAndDetect() {
    const video = document.getElementById('video');
    if (video.videoWidth===0) return;
    const c = document.createElement('canvas');
    c.width=video.videoWidth; c.height=video.videoHeight;
    c.getContext('2d').drawImage(video,0,0);
    const dataURL = c.toDataURL('image/jpeg',0.7);
    this.processEmotionData(dataURL);
  }

  processEmotionData() {
    // Mock realistic emotions
    const t=Date.now();
    const varn=Math.sin(t/10000)*0.2, noise=(Math.random()-0.5)*0.1;
    const mem = {
      happy: Math.max(0,0.3+varn+noise),
      sad: Math.max(0,0.1+noise),
      angry: Math.max(0,0.05+noise),
      fear: Math.max(0,0.08+noise),
      surprise:Math.max(0,0.1+noise),
      neutral:Math.max(0,0.5-varn+noise)
    };
    let dom='neutral', max=0;
    for(const[e,c] of Object.entries(mem)) if(c>max){max=c;dom=e;}
    if(dom!==this.currentEmotion && max<0.7) {
      max=Math.max(0.3,this.emotionConfidence-0.1);
    } else {
      this.currentEmotion=dom; this.emotionConfidence=max;
    }
    this.calculateStressLevel();
    this.logEmotion(dom,max);
    const resp=this.generateResponse();
    this.updateEmotionDisplay();
    this.updateUI(resp,this.stressLevel==='high'?'warning':'success');
  }

  calculateStressLevel() {
    const se=['angry','fear','sad'];
    if(se.includes(this.currentEmotion)&&this.emotionConfidence>0.7) this.stressLevel='high';
    else if(se.includes(this.currentEmotion)&&this.emotionConfidence>0.5) this.stressLevel='medium';
    else this.stressLevel='low';
  }

  startAudioAnalysis() {
    try {
      const AC=window.AudioContext||window.webkitAudioContext;
      this.audioContext=new AC();
      const src=this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser=this.audioContext.createAnalyser();
      this.analyser.fftSize=256; this.analyser.smoothingTimeConstant=0.8;
      src.connect(this.analyser);
      this.audioFrame();
    } catch(e){console.error('Audio setup failed',e);}
  }

  audioFrame() {
    if(!this.isMonitoring)return;
    const len=this.analyser.frequencyBinCount, arr=new Uint8Array(len);
    this.analyser.getByteFrequencyData(arr);
    const vol=arr.reduce((a,b)=>a+b)/len;
    let audioStress='low';
    if(vol>70) audioStress='high';
    else if(vol>30) audioStress='medium';
    if(audioStress==='high'&&['angry','fear'].includes(this.currentEmotion))
      this.emotionConfidence=Math.min(this.emotionConfidence+0.15,1);
    requestAnimationFrame(()=>this.audioFrame());
    this.drawAudio(arr);
  }

  generateResponse() {
    const msgs={
      happy:["😊 Great energy!","🚀 Excellent mood!"],
      sad:["😢 You okay?","💙 Earth supports you."],
      angry:["😠 Breath exercise.","🛡 You’re trained."],
      fear:["😰 You’re safe.","🔒 Ground monitors."],
      surprise:["😮 Stay focused."],
      neutral:["😐 Perfect calm.","⚖ Steady as always."]
    }[this.currentEmotion];
    const msg=msgs[Math.floor(Math.random()*msgs.length)];
    const prefix = this.stressLevel==='high'?'🚨 HIGH STRESS: ':
                   this.stressLevel==='medium'?'🔸 MODERATE STRESS: ':'✅ NORMAL: ';
    return prefix+msg;
  }

  updateEmotionDisplay() {
    const d=document.getElementById('emotion-display');
    const ic={'happy':'😊','sad':'😢','angry':'😠','fear':'😰','surprise':'😮','neutral':'😐'}[this.currentEmotion];
    const st={'low':'🟢','medium':'🟡','high':'🔴'}[this.stressLevel];
    d.innerHTML=`
      <span id="status-indicator" class="status-indicator status-online"></span>
      <strong>MAITRI Active</strong><br>
      ${ic} ${this.currentEmotion.toUpperCase()} (${(this.emotionConfidence*100).toFixed(1)}%)<br>
      Stress: ${st} ${this.stressLevel.toUpperCase()}
    `;
  }

  updateUI(msg,type='info') {
    const out=document.getElementById('maitri-output');
    const icons={success:'✅',warning:'⚠',error:'❌',loading:'🔄',info:'🤖'}[type];
    out.innerHTML='<h3>${icons} MAITRI Assistant</h3>${msg}';
  }

  updateStatusIndicator(st='offline') {
    const el=document.getElementById('status-indicator');
    el.className= 'status-indicator status-${st}';
  }

  logEmotion(e,c) {
    console.log('Log:',{ts:new Date().toISOString(),emotion:e,conf:c,stress:this.stressLevel});
  }

  handleError(err) {
    console.error(err);
    const msg=err.message.includes('denied')?
      '❌ Access denied. Allow camera/mic and refresh.':
      err.message.includes('not supported')?
      '❌ getUserMedia not supported.'
      :'❌ ${err.message}';
    this.updateUI(msg,'error');
    this.updateStatusIndicator('offline');
  }

  stopMaitriSystem() {
    this.isMonitoring=false;
    clearInterval(this.emotionInterval);
    if(this.videoStream) this.videoStream.getTracks().forEach(t=>t.stop());
    if(this.audioContext) this.audioContext.close();
    document.getElementById('video').srcObject=null;
    this.updateUI('MAITRI stopped. Stay safe!','info');
    this.updateStatusIndicator('offline');
    document.getElementById('start-btn').disabled=false;
    document.getElementById('stop-btn').disabled=true;
    document.getElementById('emotion-display').innerHTML=`
      <span id="status-indicator" class="status-indicator status-offline"></span>
      <strong>MAITRI Offline</strong><br>Click "Start Monitoring"
    `;
  }

  toggleAudio() {
    this.audioEnabled=!this.audioEnabled;
    const btn=document.getElementById('audio-btn');
    btn.textContent=this.audioEnabled?'🎤 Audio ON':'🔇 Audio OFF';
    if(this.audioEnabled && this.isMonitoring) this.startAudioAnalysis();
    else if(this.audioContext) this.audioContext.close();
  }
}

// Global controls
let maitri=null;
async function startMaitriSystem(){
  if(!maitri) maitri=new MaitriAstronautAssistant();
  await maitri.startMaitriSystem();
}
function stopMaitriSystem(){ if(maitri) maitri.stopMaitriSystem(); }
function toggleAudio(){ if(maitri) maitri.toggleAudio(); }