import * as THREE from 'three';

const $=id=>document.getElementById(id);
const ui={viewport:$('viewport'),overlay:$('overlay'),upgrade:$('upgrade'),pause:$('pause'),result:$('result'),toast:$('toast')};
const store={get(k,d){try{return JSON.parse(localStorage.getItem('void-'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('void-'+k,JSON.stringify(v))}catch{}}};
let scene,camera,renderer,clock,player,arena,stars=[],enemies=[],bullets=[],enemyShots=[],orbs=[],particles=[],decor=[];
let running=false,paused=false,choosing=false,mode='campaign',elapsed=0,kills=0,score=0,wave=1,level=1,xp=0,xpNeed=12,credits=store.get('credits',0),best=store.get('best',0),hp=100,maxHp=100,damage=18,fireRate=.48,bulletSpeed=19,moveSpeed=8,magnet=3,armor=0,projectiles=1,regen=0,spawnClock=0,shotClock=0,boss=null,bossSpawned=false,runId=0;
const input={x:0,z:0,keys:new Set(),pointer:false,joyId:null,joyX:0,joyY:0};
const upgrades=[
{id:'power',name:'Plasma Core',desc:'+35% sát thương đạn',glyph:'✦',apply:()=>damage*=1.35},
{id:'rapid',name:'Overclock',desc:'Tăng 25% tốc độ bắn',glyph:'⌁',apply:()=>fireRate=Math.max(.13,fireRate*.75)},
{id:'vital',name:'Reinforced Hull',desc:'+30 máu tối đa và hồi đầy',glyph:'⬡',apply:()=>{maxHp+=30;hp=Math.min(maxHp,hp+30)}},
{id:'swift',name:'Phase Drive',desc:'+20% tốc độ di chuyển',glyph:'➤',apply:()=>moveSpeed*=1.2},
{id:'multi',name:'Split Chamber',desc:'Bắn thêm 1 luồng đạn',glyph:'⋈',apply:()=>projectiles=Math.min(5,projectiles+1)},
{id:'magnet',name:'Gravity Well',desc:'Hút XP từ xa hơn',glyph:'◎',apply:()=>magnet+=3},
{id:'armor',name:'Aegis Shield',desc:'Giảm 15% sát thương nhận vào',glyph:'◈',apply:()=>armor=Math.min(.6,armor+.15)},
{id:'regen',name:'Nanobot Swarm',desc:'Hồi 1.5 máu mỗi giây',glyph:'✚',apply:()=>regen+=1.5},
{id:'velocity',name:'Rail Accelerator',desc:'+25% tốc độ đạn',glyph:'➶',apply:()=>bulletSpeed*=1.25}
];
function mat(color,roughness=.65,metalness=.1,emissive=0){return new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:color,emissiveIntensity:emissive})}
function mesh(geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);return m}
function init3D(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x080e19);scene.fog=new THREE.FogExp2(0x080e19,.018);
 camera=new THREE.PerspectiveCamera(52,1,.1,180);camera.position.set(0,22,25);camera.lookAt(0,0,0);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;ui.viewport.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0x9bcfff,0x101521,2.1));const sun=new THREE.DirectionalLight(0x9bdfff,2.2);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
 arena=new THREE.Group();scene.add(arena);
 const floor=mesh(new THREE.CylinderGeometry(18,18,.5,64),mat(0x152438,.9,.25),0,-.35,0);floor.receiveShadow=true;arena.add(floor);
 const grid=new THREE.GridHelper(36,36,0x28617a,0x20374c);grid.position.y=-.08;arena.add(grid);
 const ring=mesh(new THREE.TorusGeometry(18,.16,8,96),new THREE.MeshBasicMaterial({color:0x3ce2ff}));ring.rotation.x=Math.PI/2;ring.position.y=-.05;arena.add(ring);
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=18.8;const p=mesh(new THREE.ConeGeometry(.34,1.3,5),mat(0x31506c,.6,.2,.25),Math.cos(a)*r,.3,Math.sin(a)*r);p.rotation.z=Math.PI;arena.add(p)}
 for(let i=0;i<45;i++){const a=Math.random()*Math.PI*2,r=5+Math.random()*12;const rock=mesh(new THREE.DodecahedronGeometry(.25+Math.random()*.55,0),mat(i%3?0x263c51:0x285e71),Math.cos(a)*r,-.05,Math.sin(a)*r);rock.scale.y=.35;rock.rotation.set(Math.random(),Math.random(),Math.random());arena.add(rock);decor.push(rock)}
 const starGeo=new THREE.BufferGeometry(),positions=[];for(let i=0;i<600;i++)positions.push((Math.random()-.5)*150,12+Math.random()*60,(Math.random()-.5)*150);starGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const starMat=new THREE.PointsMaterial({color:0x9acfff,size:.16,transparent:true,opacity:.7});scene.add(new THREE.Points(starGeo,starMat));
 player=new THREE.Group();const body=mesh(new THREE.CapsuleGeometry(.48,.8,4,8),mat(0x48dfff,.3,.55,.5),0,.72,0);body.castShadow=true;player.add(body);const core=mesh(new THREE.OctahedronGeometry(.34),new THREE.MeshStandardMaterial({color:0xc5ffff,emissive:0x43dfff,emissiveIntensity:2,metalness:.4,roughness:.2}),0,1.55,0);player.add(core);const ringP=mesh(new THREE.TorusGeometry(.72,.055,8,32),new THREE.MeshBasicMaterial({color:0x53e8ff}),0,.22,0);ringP.rotation.x=Math.PI/2;player.add(ringP);scene.add(player);
 clock=new THREE.Clock();resize();window.addEventListener('resize',resize);renderer.setAnimationLoop(frame);
}
function resize(){if(!renderer)return;const w=ui.viewport.clientWidth,h=ui.viewport.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
function makeEnemy(type='drone',isBoss=false){
 const g=new THREE.Group();let color=type==='brute'?0xffa34f:type==='runner'?0xff557b:type==='spitter'?0xc178ff:0xe85d86;if(isBoss)color=0xff315e;
 const body=mesh(isBoss?new THREE.IcosahedronGeometry(1.55,1):type==='brute'?new THREE.DodecahedronGeometry(.9,1):type==='runner'?new THREE.TetrahedronGeometry(.72,1):new THREE.IcosahedronGeometry(.65,1),new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.35,emissive:color,emissiveIntensity:isBoss?.65:.22}),0,isBoss?1.65:.8,0);body.castShadow=true;g.add(body);
 const eye=mesh(new THREE.SphereGeometry(isBoss?.2:.12,8,8),new THREE.MeshBasicMaterial({color:0xfff1c9}),0,isBoss?1.8:.92,.52);g.add(eye);
 if(isBoss){const halo=mesh(new THREE.TorusGeometry(2,.09,8,48),new THREE.MeshBasicMaterial({color:0xff537a}));halo.rotation.x=Math.PI/2;halo.position.y=.1;g.add(halo);g.userData.maxHp=900+wave*220;g.userData.hp=g.userData.maxHp;g.userData.speed=1.45;g.userData.damage=22;g.userData.radius=1.5}
 else{g.userData.maxHp=type==='brute'?115:type==='runner'?36:type==='spitter'?48:58;g.userData.hp=g.userData.maxHp;g.userData.speed=type==='brute'?1.8:type==='runner'?4.7:type==='spitter'?1.9:2.7;g.userData.damage=type==='brute'?18:10;g.userData.radius=type==='brute'?.85:.58}
 g.userData.type=type;g.userData.isBoss=isBoss;g.userData.attack=0;g.userData.hit=0;let a=Math.random()*Math.PI*2,r=18+Math.random()*3;g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(g);enemies.push(g);if(isBoss){boss=g;ui.bossWrap=$('boss-wrap');ui.bossWrap.classList.remove('hidden');$('boss-hp-label').textContent='100%';$('boss-bar').style.width='100%';showToast('⚠ VOID TITAN ĐÃ XUẤT HIỆN')}
 return g;
}
function spawnEnemy(){if(enemies.length>95)return;let t='drone',roll=Math.random();if(wave>1&&roll<.18)t='runner';else if(wave>2&&roll<.34)t='spitter';else if(wave>3&&roll<.52)t='brute';makeEnemy(t)}
function spawnBoss(){if(bossSpawned)return;bossSpawned=true;makeEnemy('boss',true)}
function clearGroup(arr){for(const o of arr)scene.remove(o);arr.length=0}
function resetRun(){
 runId++;clearGroup(enemies);clearGroup(bullets);clearGroup(enemyShots);clearGroup(orbs);clearGroup(particles);if(boss){scene.remove(boss);boss=null}
 elapsed=0;kills=0;score=0;wave=1;level=1;xp=0;xpNeed=12;hp=100;maxHp=100;damage=18;fireRate=.48;bulletSpeed=19;moveSpeed=8;magnet=3;armor=0;projectiles=1;regen=0;spawnClock=1;shotClock=0;bossSpawned=false;choosing=false;paused=false;player.position.set(0,0,0);$('boss-wrap').classList.add('hidden');updateHUD();ui.overlay.classList.add('hidden');ui.upgrade.classList.add('hidden');ui.pause.classList.add('hidden');ui.result.classList.add('hidden');running=true;clock.getDelta();
}
function updateHUD(){const m=Math.floor(elapsed/60),s=Math.floor(elapsed%60);$('time').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('wave').textContent=String(wave).padStart(2,'0');$('kills').textContent=kills;$('level').textContent=level;$('hp-label').textContent=Math.ceil(hp)+' / '+maxHp;$('hp-bar').style.width=Math.max(0,hp/maxHp*100)+'%';$('xp-label').textContent=xp+' / '+xpNeed+' XP';$('xp-bar').style.width=xp/xpNeed*100+'%';$('coins').textContent=credits;$('best').textContent=best}
function updateMenu(){ $('menu-best').textContent=best;$('menu-coins').textContent=credits;$('coins').textContent=credits;$('best').textContent=best}
function showToast(msg){ui.toast.textContent=msg;ui.toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>ui.toast.classList.remove('show'),1400)}
function gainXP(n){xp+=n;while(xp>=xpNeed){xp-=xpNeed;level++;xpNeed=Math.floor(xpNeed*1.24+5);levelUp()}}
function levelUp(){choosing=true;running=false;clock.getDelta();const picks=[...upgrades].sort(()=>Math.random()-.5).slice(0,3);$('upgrade-options').innerHTML='';for(const u of picks){const b=document.createElement('button');b.className='upgrade-card';b.innerHTML='<span class="glyph">'+u.glyph+'</span><b>'+u.name+'</b><small>'+u.desc+'</small>';b.addEventListener('click',()=>{u.apply();ui.upgrade.classList.add('hidden');choosing=false;running=true;clock.getDelta();showToast(u.name.toUpperCase()+' ONLINE');updateHUD()},{once:true});$('upgrade-options').appendChild(b)}ui.upgrade.classList.remove('hidden')}
function fire(){let target=null,dist=Infinity;for(const e of enemies){const d=player.position.distanceTo(e.position);if(d<dist){dist=d;target=e}}if(!target)return;const dir=new THREE.Vector3().subVectors(target.position,player.position).setY(0).normalize();for(let i=0;i<projectiles;i++){const spread=(i-(projectiles-1)/2)*.11;const d=dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread);const b=mesh(new THREE.SphereGeometry(.16,8,8),new THREE.MeshBasicMaterial({color:0x8ef8ff}),player.position.x,.95,player.position.z);b.userData={vel:d.multiplyScalar(bulletSpeed),life:1.8,damage};scene.add(b);bullets.push(b)}}
function makeOrb(pos,value){const o=mesh(new THREE.IcosahedronGeometry(.22,0),new THREE.MeshStandardMaterial({color:0x9cff83,emissive:0x64ff8a,emissiveIntensity:1.2}),pos.x,.35,pos.z);o.userData={value};scene.add(o);orbs.push(o)}
function burst(pos,color=0x70eaff,count=8){for(let i=0;i<count;i++){const p=mesh(new THREE.SphereGeometry(.07,5,5),new THREE.MeshBasicMaterial({color,transparent:true}),pos.x,.8+Math.random()*.5,pos.z);p.userData={vel:new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5),life:.45+Math.random()*.45};scene.add(p);particles.push(p)}}
function hurt(n){hp-=Math.max(1,n*(1-armor));if(hp<=0){hp=0;endRun(false)}updateHUD()}
function defeat(e){const pos=e.position.clone();const bossKill=e.userData.isBoss;scene.remove(e);enemies.splice(enemies.indexOf(e),1);if(bossKill){boss=null;ui.bossWrap.classList.add('hidden');credits+=30;score+=2500;makeOrb(pos,10);showToast('VOID TITAN ĐÃ BỊ TIÊU DIỆT!');if(mode==='campaign'&&wave>=10){endRun(true);return}}else{makeOrb(pos,1+Math.floor(wave/4));score+=10+wave*2}
 kills++;burst(pos,bossKill?0xff547b:0x77eaff,bossKill?35:9);if(kills%25===0){credits+=2;store.set('credits',credits)}updateHUD()}
function endRun(victory){running=false;paused=false;const final=Math.floor(score+elapsed*4+wave*100);best=Math.max(best,final);credits+=Math.floor(final/500);store.set('best',best);store.set('credits',credits);updateMenu();$('result-title').textContent=victory?'KHU VỰC ĐÃ ĐƯỢC GIẢI PHÓNG':'TÍN HIỆU ĐÃ TẮT';$('final-score').textContent=final.toLocaleString('vi-VN');$('final-kills').textContent=kills;$('final-time').textContent=$('time').textContent;$('final-wave').textContent=wave;ui.result.classList.remove('hidden')}
function pauseGame(){if(!running&&!paused)return;paused=!paused;running=!paused;ui.pause.classList.toggle('hidden',!paused);clock.getDelta()}
function startGame(){mode=document.querySelector('.mode.active').dataset.mode;resetRun()}
function goMenu(){running=false;paused=false;ui.pause.classList.add('hidden');ui.result.classList.add('hidden');ui.upgrade.classList.add('hidden');ui.overlay.classList.remove('hidden');updateMenu()}
function moveInput(){let x=0,z=0;if(input.keys.has('KeyA')||input.keys.has('ArrowLeft'))x--;if(input.keys.has('KeyD')||input.keys.has('ArrowRight'))x++;if(input.keys.has('KeyW')||input.keys.has('ArrowUp'))z--;if(input.keys.has('KeyS')||input.keys.has('ArrowDown'))z++;x+=input.x;z+=input.z;const v=new THREE.Vector2(x,z);if(v.length()>1)v.normalize();return v}
function frame(){
 const dt=Math.min(clock.getDelta(),.04);if(running&&!choosing){elapsed+=dt;const newWave=Math.floor(elapsed/45)+1;if(newWave>wave){wave=newWave;showToast('WAVE '+wave+' INCOMING');if(wave%2===0)credits+=2}
 if(elapsed>=300&&!bossSpawned)spawnBoss();if(mode==='campaign'&&wave>=10&&elapsed>=450&&!bossSpawned)spawnBoss();
 const mv=moveInput();player.position.x+=mv.x*moveSpeed*dt;player.position.z+=mv.y*moveSpeed*dt;const len=Math.hypot(player.position.x,player.position.z);if(len>16.2){player.position.x*=16.2/len;player.position.z*=16.2/len}
 player.rotation.y=Math.atan2(mv.x,mv.y);player.children[1].rotation.y+=dt*2;player.children[2].rotation.z+=dt*1.5;
 shotClock-=dt;if(shotClock<=0){fire();shotClock=fireRate}
 spawnClock-=dt;if(spawnClock<=0){spawnEnemy();spawnClock=Math.max(.22,1.25-wave*.065)*(0.65+Math.random()*.65)}
 hp=Math.min(maxHp,hp+regen*dt);
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i],v=new THREE.Vector3(player.position.x-e.position.x,0,player.position.z-e.position.z),d=v.length();if(d>.001){v.normalize();if(e.userData.type==='spitter'&&d<9){e.userData.attack-=dt;if(e.userData.attack<=0){const shot=mesh(new THREE.SphereGeometry(.18,8,8),new THREE.MeshBasicMaterial({color:0xd58cff}),e.position.x,.8,e.position.z);shot.userData={vel:v.clone().multiplyScalar(8),life:3,damage:9};scene.add(shot);enemyShots.push(shot);e.userData.attack=2.2}}else e.position.addScaledVector(v,e.userData.speed*dt)}
 e.rotation.y+=dt*1.8;e.position.y=Math.sin(elapsed*4+i)*.08;
 if(d<e.userData.radius+.65){e.userData.attack-=dt;if(e.userData.attack<=0){hurt(e.userData.damage);e.userData.attack=e.userData.isBoss?.65:.85}}
 if(e.userData.isBoss){$('boss-hp-label').textContent=Math.ceil(e.userData.hp/e.userData.maxHp*100)+'%';$('boss-bar').style.width=Math.max(0,e.userData.hp/e.userData.maxHp*100)+'%'}
 }
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.position.addScaledVector(b.userData.vel,dt);b.userData.life-=dt;let hit=null;for(const e of enemies){if(b.position.distanceTo(e.position.clone().add(new THREE.Vector3(0,.8,0)))<e.userData.radius+.25){hit=e;break}}if(hit){hit.userData.hp-=b.userData.damage;burst(b.position,0x8ef8ff,3);scene.remove(b);bullets.splice(i,1);if(hit.userData.hp<=0)defeat(hit)}else if(b.userData.life<=0||Math.hypot(b.position.x,b.position.z)>22){scene.remove(b);bullets.splice(i,1)}}
 for(let i=enemyShots.length-1;i>=0;i--){const b=enemyShots[i];b.position.addScaledVector(b.userData.vel,dt);b.userData.life-=dt;if(b.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,.8,0)))<.85){hurt(b.userData.damage);scene.remove(b);enemyShots.splice(i,1)}else if(b.userData.life<=0){scene.remove(b);enemyShots.splice(i,1)}}
 for(let i=orbs.length-1;i>=0;i--){const o=orbs[i],d=o.position.distanceTo(player.position);o.rotation.y+=dt*2;if(d<magnet+2)o.position.lerp(new THREE.Vector3(player.position.x,.35,player.position.z),Math.min(1,dt*(d<3?8:3)));if(d<.85){gainXP(o.userData.value);scene.remove(o);orbs.splice(i,1)}}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.position.addScaledVector(p.userData.vel,dt);p.userData.vel.y-=8*dt;p.userData.life-=dt;p.scale.multiplyScalar(.97);if(p.userData.life<=0){scene.remove(p);particles.splice(i,1)}}
 if(Math.floor(elapsed)%2===0)updateHUD();
 }
 const camTarget=new THREE.Vector3(player.position.x,0,player.position.z);camera.position.lerp(new THREE.Vector3(camTarget.x,22,camTarget.z+25),.055);camera.lookAt(camTarget);renderer.render(scene,camera);
}
function bindControls(){
 window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();input.keys.add(e.code);if(e.code==='Escape')pauseGame()});
 window.addEventListener('keyup',e=>input.keys.delete(e.code));window.addEventListener('blur',()=>{input.keys.clear();input.x=input.z=0});
 const joy=$('joystick'),stick=$('stick');joy.addEventListener('pointerdown',e=>{input.joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===input.joyId)joyMove(e)});function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=35,l=Math.hypot(dx,dy),k=l>max?max/l:1;input.x=dx*k/max;input.z=dy*k/max;stick.style.left='calc(50% + '+dx*k+'px)';stick.style.top='calc(50% + '+dy*k+'px)'}
 function joyEnd(e){if(e.pointerId!==input.joyId)return;input.joyId=null;input.x=input.z=0;stick.style.left='50%';stick.style.top='50%'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
 $('start-btn').addEventListener('click',startGame);$('pause-btn').addEventListener('click',pauseGame);$('resume-btn').addEventListener('click',pauseGame);$('quit-btn').addEventListener('click',goMenu);$('again-btn').addEventListener('click',startGame);$('menu-btn').addEventListener('click',goMenu);
 document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
}
init3D();bindControls();updateMenu();updateHUD();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
