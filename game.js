'use strict';
(() => {
const $ = id => document.getElementById(id);
const STORE_KEY = 'hotel-empire-save-v1';
const DAY_MINUTES = 900;
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const number = n => Math.floor(n).toLocaleString('vi-VN');
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const rand = (a,b) => Math.random()*(b-a)+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roomTypes = {
 standard:{name:'Standard',label:'Tiêu chuẩn',base:75,comfort:55,capacity:2,build:8500,clean:8},
 deluxe:{name:'Deluxe',label:'Cao cấp',base:125,comfort:72,capacity:2,build:14500,clean:13},
 suite:{name:'Suite',label:'Suite',base:220,comfort:88,capacity:3,build:28000,clean:22},
 family:{name:'Family',label:'Gia đình',base:175,comfort:80,capacity:4,build:22000,clean:18}
};
const roles = {
 reception:{name:'Lễ tân',salary:1250,productivity:1.0},
 housekeeping:{name:'Buồng phòng',salary:1050,productivity:1.0},
 kitchen:{name:'Bếp & nhà hàng',salary:1350,productivity:1.0},
 maintenance:{name:'Kỹ thuật',salary:1450,productivity:1.0},
 manager:{name:'Quản lý',salary:2600,productivity:1.0}
};
const facilities = {
 restaurant:{name:'Nhà hàng',cost:18000,upkeep:230,bonus:8,desc:'Tăng doanh thu phụ trợ và mức hài lòng.'},
 spa:{name:'Spa & wellness',cost:26000,upkeep:310,bonus:10,desc:'Thu hút khách nghỉ dưỡng, tăng giá trị đơn.'},
 conference:{name:'Phòng hội nghị',cost:34000,upkeep:390,bonus:12,desc:'Mở khóa khách đoàn và hợp đồng doanh nghiệp.'},
 pool:{name:'Hồ bơi',cost:22000,upkeep:280,bonus:9,desc:'Tăng sức hút và điểm đánh giá.'},
 airport:{name:'Đưa đón sân bay',cost:12500,upkeep:180,bonus:5,desc:'Tăng chuyển đổi đặt phòng.'}
};
const research = [
{id:'yield',name:'Revenue Management',cost:12000,desc:'Tối ưu giá theo nhu cầu; tăng doanh thu phòng 8%.',effect:s=>s.bonuses.yield+=.08},
{id:'service',name:'Service Excellence',cost:16000,desc:'Quy trình dịch vụ tốt hơn; tăng chất lượng 8 điểm.',effect:s=>s.bonuses.service+=8},
{id:'automation',name:'Smart Operations',cost:24000,desc:'Tự động hóa vận hành; giảm chi phí vận hành 10%.',effect:s=>s.bonuses.automation+=.1},
{id:'loyalty',name:'Loyalty Program',cost:20000,desc:'Khách quay lại thường xuyên hơn; tăng nhu cầu 10%.',effect:s=>s.bonuses.loyalty+=.1},
{id:'green',name:'Green Hotel',cost:28000,desc:'Tiết kiệm năng lượng và tăng danh tiếng.',effect:s=>s.bonuses.green+=.12}
];
const events = [
{title:'Hội chợ du lịch trong thành phố',text:'Lượng khách tìm phòng tăng trong ngày.',demand:1.28,rep:0},
{title:'Đợt nắng nóng',text:'Chi phí điện tăng do điều hòa hoạt động liên tục.',cost:1.22,rep:0},
{title:'Bài đánh giá tích cực lan truyền',text:'Khách mới tin tưởng thương hiệu hơn.',demand:1.12,rep:3},
{title:'Sự cố đường ống nước',text:'Một khoản bảo trì khẩn cấp phát sinh.',expense:1800,rep:-2},
{title:'Đoàn khách doanh nghiệp',text:'Có cơ hội nhận hợp đồng lưu trú theo đoàn.',contract:true,rep:0},
{title:'Mùa thấp điểm',text:'Nhu cầu đặt phòng giảm tạm thời.',demand:.78,rep:0},
{title:'Đầu bếp được vinh danh',text:'Nhà hàng được chú ý, khách hài lòng hơn.',rep:2,demand:1.08},
{title:'Đối thủ khai trương',text:'Thị trường cạnh tranh hơn trong vài ngày.',demand:.9,rep:0}
];
const freshState = () => ({
version:1,hotelName:'The First Stay',location:'Đà Nẵng · Việt Nam',day:1,minute:480,paused:false,speed:1,
cash:120000,debt:30000,reputation:65,stars:2,experience:0,level:1,
rooms:{standard:12,deluxe:6,suite:2,family:0},occupied:0,bookings:[],guests:[],nextGuestId:1,
prices:{standard:75,deluxe:125,suite:220,family:175},staff:{reception:3,housekeeping:5,kitchen:2,maintenance:1,manager:1},
morale:78,service:68,cleanliness:86,condition:92,energy:85,stock:100,
facilities:{restaurant:true,spa:false,conference:false,pool:false,airport:false},
researched:[],bonuses:{yield:0,service:0,automation:0,loyalty:0,green:0},
marketing:0,marketingUntil:0,contract:null,history:[],log:[],lastSave:Date.now(),
today:{revenue:0,expenses:0,checkins:0,checkouts:0,complaints:0,booked:0},
lifetime:{revenue:0,guests:0,days:0,profit:0}
});
let state;
let currentTab='overview';
let timer=null;
let lastRender=0;
let toastTimer=null;
function loadState(){
 try{
  const raw=localStorage.getItem(STORE_KEY);
  if(!raw)return freshState();
  const parsed=JSON.parse(raw);
  const base=freshState();
  const merged={...base,...parsed,rooms:{...base.rooms,...parsed.rooms},prices:{...base.prices,...parsed.prices},staff:{...base.staff,...parsed.staff},facilities:{...base.facilities,...parsed.facilities},bonuses:{...base.bonuses,...parsed.bonuses},today:{...base.today,...parsed.today},lifetime:{...base.lifetime,...parsed.lifetime}};
  return merged;
 }catch{return freshState()}
}
function saveState(silent=false){
 state.lastSave=Date.now();
 try{localStorage.setItem(STORE_KEY,JSON.stringify(state));if(!silent)toast('Đã lưu tiến trình.','success')}
 catch{if(!silent)toast('Không thể lưu. Bộ nhớ trình duyệt có thể đã đầy.','error')}
}
function log(message,type='info'){
 state.log.unshift({day:state.day,minute:state.minute,text:message,type});
 state.log=state.log.slice(0,80);
}
function toast(message,type='info'){
 const el=document.createElement('div');el.className='toast '+type;el.textContent=message;$('toast-region').append(el);
 setTimeout(()=>el.remove(),3400);
}
function totalRooms(){return Object.values(state.rooms).reduce((a,b)=>a+b,0)}
function occupiedRooms(){return state.guests.filter(g=>g.status==='staying').length}
function occupancy(){return totalRooms()?occupiedRooms()/totalRooms():0}
function roomRevenue(){return Object.entries(state.rooms).reduce((sum,[type,count])=>sum+count*state.prices[type],0)}
function staffCount(){return Object.values(state.staff).reduce((a,b)=>a+b,0)}
function dailyPayroll(){return Object.entries(state.staff).reduce((sum,[role,count])=>sum+roles[role].salary*count/30,0)}
function facilityUpkeep(){return Object.entries(state.facilities).reduce((sum,[id,active])=>sum+(active?facilities[id].upkeep:0),0)}
function guestDemand(){
 const season=1+Math.sin((state.day%30)/30*Math.PI*2)*.13;
 const rep=0.65+state.reputation/180;
 const starsFactor=1+(state.stars-2)*.055;
 const marketing=state.marketingUntil>=state.day?1+state.marketing:1;
 const loyalty=1+state.bonuses.loyalty;
 const capacity=totalRooms();
 return Math.max(0,Math.round((capacity*.11+2)*season*rep*starsFactor*marketing*loyalty));
}
function addGuest(){
 const free=totalRooms()-occupiedRooms();
 if(free<=0)return;
 const available=Object.entries(state.rooms).filter(([type,count])=>count>state.guests.filter(g=>g.status==='staying'&&g.type===type).length);
 if(!available.length)return;
 const weights=available.map(([type,count])=>Math.max(1,count)*Math.max(1,roomTypes[type].comfort));
 const total=weights.reduce((a,b)=>a+b,0);let roll=Math.random()*total;let chosen=available[0][0];
 for(let i=0;i<available.length;i++){roll-=weights[i];if(roll<=0){chosen=available[i][0];break}}
 const rate=state.prices[chosen];
 const stay=Math.ceil(rand(1,4));
 const satisfaction=clamp(Math.round(state.service*.45+state.cleanliness*.35+roomTypes[chosen].comfort*.2+rand(-8,8)),20,100);
 state.guests.push({id:state.nextGuestId++,name:pick(['Minh Anh','Hoàng Nam','Gia Hân','Quốc Bảo','Thanh Vy','Tuấn Kiệt','Mai Chi','Khánh Linh','Đức Anh','Bảo Ngọc']),type:chosen,rate,stay,remaining:stay,status:'staying',satisfaction,spent:0});
 state.today.checkins++;state.today.booked++;
 log('Khách mới nhận phòng '+roomTypes[chosen].label+' · '+money(rate)+'/đêm.');
}
function updateGuestMinute(){
 for(const g of state.guests.filter(x=>x.status==='staying')){
  g.spent+=g.rate/DAY_MINUTES;
  if(state.minute%60===0&&Math.random()<.025){
   const extra=state.facilities.restaurant?rand(8,28):rand(0,8);
   state.cash+=extra;state.today.revenue+=extra;state.lifetime.revenue+=extra;g.spent+=extra;
  }
  if(state.minute%1440===0){g.remaining--;if(g.remaining<=0)checkout(g)}
 }
 state.guests=state.guests.filter(g=>g.status==='staying');
}
function checkout(g){
 g.status='checked-out';const score=clamp(g.satisfaction+(state.service-65)*.08+(state.cleanliness-80)*.08,1,100);
 state.reputation=clamp(state.reputation+(score>=80?.16:score<55?-.35:.04),5,100);
 state.today.checkouts++;state.lifetime.guests++;log(g.name+' trả phòng · mức hài lòng '+Math.round(score)+'/100.');
}
function operatingCostPerMinute(){
 const rooms=totalRooms();
 const utilities=(rooms*1.35+occupiedRooms()*1.1)*(1-state.bonuses.green);
 const maintenance=(100-state.condition)*.035+facilityUpkeep()/1440;
 const wages=dailyPayroll()/1440;
 return (utilities+maintenance+wages)*(1-state.bonuses.automation);
}
function simulateMinute(){
 if(state.minute>=480+DAY_MINUTES){closeDay(true);return}
 state.minute++;
 const demand=guestDemand()/DAY_MINUTES;
 if(Math.random()<demand*1.7)addGuest();
 updateGuestMinute();
 const occ=occupancy();
 const income=state.guests.filter(g=>g.status==='staying').reduce((a,g)=>a+g.rate/DAY_MINUTES,0);
 state.cash+=income;state.today.revenue+=income;state.lifetime.revenue+=income;
 const cost=operatingCostPerMinute();state.cash-=cost;state.today.expenses+=cost;
 if(state.minute%60===0){
  state.energy=clamp(state.energy-(2+occ*3),8,100);
  state.cleanliness=clamp(state.cleanliness-(occ*2.1)+state.staff.housekeeping*.42,15,100);
  state.condition=clamp(state.condition-.25+(state.staff.maintenance*.08),15,100);
  state.morale=clamp(state.morale-.12+(state.staff.manager*.06),15,100);
 }
 if(state.minute%180===0)maybeEvent();
 if(state.minute>=480+DAY_MINUTES)closeDay(true);
}
function maybeEvent(){
 if(Math.random()>.48)return;
 const event=pick(events);
 state.log.unshift({day:state.day,minute:state.minute,text:'SỰ KIỆN: '+event.title+' — '+event.text,type:'event'});
 state.currentEvent={...event,until:state.day+1};
 if(event.rep)state.reputation=clamp(state.reputation+event.rep,0,100);
 if(event.expense){state.cash-=event.expense;state.today.expenses+=event.expense}
}
function closeDay(automatic=false){
 const occ=occupancy()*100;
 const revenue=state.today.revenue,expenses=state.today.expenses;
 const profit=revenue-expenses;
 state.history.unshift({day:state.day,revenue,expenses,profit,occupancy:occ,guests:state.today.checkins});
 state.history=state.history.slice(0,30);
 state.lifetime.days++;state.lifetime.profit+=profit;
 state.experience+=Math.max(1,Math.floor(state.today.checkins/2)+Math.max(0,Math.floor(profit/1000)));
 if(state.experience>=state.level*120){state.experience-=state.level*120;state.level++;state.stars=clamp(2+Math.floor((state.level-1)/3),2,5);log('Thăng hạng khách sạn! Mở cấp '+state.level+'.')}
 if(state.contract&&state.contract.due<=state.day){if(state.contract.progress>=state.contract.target){state.cash+=state.contract.reward;state.reputation=clamp(state.reputation+3,0,100);log('Hoàn thành hợp đồng doanh nghiệp: +'+money(state.contract.reward),'success')}else{state.reputation=clamp(state.reputation-4,0,100);log('Không đạt chỉ tiêu hợp đồng.','warning')}state.contract=null}
 if(state.debt>0){const interest=state.debt*.0008;state.cash-=interest;log('Lãi vay trong ngày: '+money(interest)+'.')}
 state.day++;state.minute=480;state.today={revenue:0,expenses:0,checkins:0,checkouts:0,complaints:0,booked:0};
 state.cleanliness=clamp(state.cleanliness+state.staff.housekeeping*2.2,0,100);
 state.energy=clamp(state.energy+12,0,100);
 state.condition=clamp(state.condition+state.staff.maintenance*.7,0,100);
 state.stock=clamp(state.stock+15,0,100);
 state.morale=clamp(state.morale+1,0,100);
 log('Đã chốt ngày '+(state.day-1)+'. Lợi nhuận: '+money(profit)+'. Công suất cuối ngày: '+Math.round(occ)+'%.');
 saveState(true);
 if(!automatic)toast('Đã chuyển sang ngày '+state.day+'.','success');
 render();
}
function applyOffline(){
 const elapsed=clamp(Date.now()-(state.lastSave||Date.now()),0,MAX_OFFLINE_MS);
 const minutes=Math.floor(elapsed/1000*state.speed*5);
 if(minutes<=0)return;
 const capped=Math.min(minutes,DAY_MINUTES*3);
 let earned=0;
 for(let i=0;i<capped;i++){
  const occ=occupancy();const rev=state.guests.reduce((a,g)=>a+g.rate/DAY_MINUTES,0);
  const cost=operatingCostPerMinute();earned+=rev-cost;
  state.minute++;
  if(state.minute>=480+DAY_MINUTES){state.day++;state.minute=480;state.today={revenue:0,expenses:0,checkins:0,checkouts:0,complaints:0,booked:0};state.history.unshift({day:state.day-1,revenue:0,expenses:0,profit:0,occupancy:occ*100,guests:0})}
  if(i%60===0){state.cleanliness=clamp(state.cleanliness-.5+state.staff.housekeeping*.12,0,100);state.condition=clamp(state.condition-.15+state.staff.maintenance*.04,0,100)}
 }
 state.cash+=earned;state.today.revenue+=Math.max(0,earned);state.lifetime.profit+=earned;state.lastSave=Date.now();
 if(capped>0)state.log.unshift({day:state.day,minute:state.minute,text:'Mô phỏng offline '+number(capped)+' phút · '+(earned>=0?'+':'')+money(earned)+'.',type:'info'});
}
function fmtTime(minute){const m=minute%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function bar(label,value,color=''){return '<div class="stat-row"><span>'+label+'</span><div class="bar"><i class="'+color+'" style="width:'+clamp(value,0,100)+'%"></i></div><strong>'+Math.round(value)+'%</strong></div>'}
function metric(label,value,note='',tone=''){return '<div class="metric-card"><div class="metric-label">'+label+'</div><div class="metric-value '+tone+'">'+value+'</div><div class="metric-note">'+note+'</div></div>'}
function panel(title,subtitle,body,span='span-6'){return '<section class="panel '+span+'"><div class="section-head"><div><h3>'+title+'</h3><div class="panel-subtitle">'+subtitle+'</div></div></div>'+body+'</section>'}
function renderOverview(){
 const occ=occupiedRooms(),rooms=totalRooms(),rev=state.today.revenue,profit=rev-state.today.expenses;
 const trend=state.history.slice(0,7).reverse();const max=Math.max(1,...trend.map(x=>Math.abs(x.profit)));
 const chart=trend.length?'<div class="chart">'+trend.map(x=>'<div class="chart-col"><i style="height:'+Math.max(3,Math.abs(x.profit)/max*85)+'%"></i><small>D'+x.day+'</small></div>').join('')+'</div>':'<div class="empty-state">Báo cáo sẽ xuất hiện sau ngày đầu tiên.</div>';
 const logs=state.log.slice(0,7).map(x=>'<div class="log-item"><time>D'+x.day+' '+fmtTime(x.minute)+'</time><p>'+escapeHTML(x.text)+'</p></div>').join('')||'<div class="empty-state">Chưa có hoạt động.</div>';
 return '<div class="dashboard-grid">'+
 metric('Doanh thu hôm nay',money(rev),'Doanh thu tích lũy trong ngày','positive')+
 metric('Lợi nhuận tạm tính',(profit<0?'−':'')+money(Math.abs(profit)),'Sau chi phí vận hành',profit>=0?'positive':'negative')+
 metric('Công suất phòng',Math.round(occupancy()*100)+'%',occ+' / '+rooms+' phòng đang sử dụng','accent')+
 metric('Danh tiếng',Math.round(state.reputation)+'/100','Hạng '+state.stars+' sao','gold')+
 panel('Hiệu suất vận hành','Chỉ số ảnh hưởng trực tiếp tới trải nghiệm khách', '<div class="stat-list">'+bar('Chất lượng dịch vụ',state.service)+bar('Vệ sinh',state.cleanliness,'blue')+bar('Tình trạng cơ sở',state.condition,'gold')+bar('Năng lượng',state.energy,'gold')+bar('Tinh thần nhân viên',state.morale,'blue')+'</div>','span-5')+
 panel('Dòng tiền 7 ngày','Lợi nhuận sau chi phí theo ngày',chart,'span-7')+
 panel('Hoạt động gần đây','Nhật ký vận hành theo thời gian', '<div class="log-list">'+logs+'</div>','span-7')+
 panel('Quyết định nhanh','Các hành động thường dùng', '<div class="action-grid"><div class="action-card"><strong>Chiến dịch marketing</strong><p>Thu hút thêm khách trong 3 ngày.</p><button class="button button-secondary" data-action="marketing">Chạy chiến dịch</button></div><div class="action-card"><strong>Bảo trì tổng thể</strong><p>Khôi phục tình trạng cơ sở vật chất.</p><button class="button button-secondary" data-action="maintenance">Bảo trì ngay</button></div><div class="action-card"><strong>Điều chỉnh giá</strong><p>Tối ưu doanh thu theo nhu cầu.</p><button class="button button-secondary" data-action="pricing">Định giá phòng</button></div><div class="action-card"><strong>Nhận hợp đồng</strong><p>Nhận đoàn khách doanh nghiệp.</p><button class="button button-secondary" data-action="contract">Tìm hợp đồng</button></div></div>','span-5')+
 '</div>';
}
function renderRooms(){
 const rows=Object.entries(state.rooms).map(([type,count])=>{
  const staying=state.guests.filter(g=>g.type===type).length;
  const r=roomTypes[type];
  return '<tr><td><strong>'+r.label+'</strong><div class="muted">'+r.capacity+' khách/phòng · tiện nghi '+r.comfort+'/100</div></td><td>'+count+'</td><td>'+staying+'</td><td>'+money(state.prices[type])+'</td><td><button class="mini-button" data-action="price" data-type="'+type+'">Đổi giá</button> <button class="mini-button" data-action="build-room" data-type="'+type+'">Mở rộng</button></td></tr>'
 }).join('');
 const guestRows=state.guests.slice(0,12).map(g=>'<tr><td>#'+g.id+' · '+escapeHTML(g.name)+'</td><td>'+roomTypes[g.type].label+'</td><td>'+g.remaining+' đêm</td><td>'+money(g.rate)+'</td><td><span class="tag good">Đang lưu trú</span></td></tr>').join('');
 return '<div class="dashboard-grid">'+
 metric('Tổng số phòng',number(totalRooms()),'Sức chứa toàn khách sạn')+
 metric('Đang có khách',number(occupiedRooms()),'Phòng đang được sử dụng','accent')+
 metric('Phòng trống',number(totalRooms()-occupiedRooms()),'Có thể nhận khách','positive')+
 metric('Giá phòng bình quân',money(roomRevenue()/Math.max(1,totalRooms())),'Giá niêm yết trung bình')+
 panel('Danh mục phòng','Quản lý giá, số lượng và sức chứa','<div class="table-wrap"><table><thead><tr><th>LOẠI PHÒNG</th><th>TỔNG</th><th>ĐANG Ở</th><th>GIÁ/ĐÊM</th><th>THAO TÁC</th></tr></thead><tbody>'+rows+'</tbody></table></div>','span-12')+
 panel('Danh sách khách đang lưu trú','Theo dõi đặt phòng và thời gian trả phòng','<div class="table-wrap"><table><thead><tr><th>KHÁCH</th><th>LOẠI PHÒNG</th><th>CÒN LẠI</th><th>GIÁ/ĐÊM</th><th>TRẠNG THÁI</th></tr></thead><tbody>'+guestRows+'</tbody></table></div>','span-12')+
 '</div>';
}
function renderOperations(){
 const fac=Object.entries(facilities).map(([id,f])=>{
  const active=state.facilities[id];
  return '<div class="action-card"><div class="row-between"><strong>'+f.name+'</strong><span class="tag '+(active?'good':'warn')+'">'+(active?'Đang hoạt động':'Chưa xây dựng')+'</span></div><p>'+f.desc+'</p><p class="muted">Đầu tư '+money(f.cost)+' · Duy trì '+money(f.upkeep)+'/ngày</p><button class="button button-secondary" data-action="facility" data-id="'+id+'" '+(active?'disabled':'')+'>'+(active?'Đã mở': 'Đầu tư cơ sở')+'</button></div>'
 }).join('');
 return '<div class="dashboard-grid">'+
 metric('Chất lượng dịch vụ',Math.round(state.service)+'/100','Năng lực phục vụ')+
 metric('Vệ sinh',Math.round(state.cleanliness)+'/100','Phụ thuộc đội buồng phòng')+
 metric('Tình trạng',Math.round(state.condition)+'/100','Cần bảo trì định kỳ')+
 metric('Năng lượng',Math.round(state.energy)+'/100','Tác động chi phí điện')+
 panel('Kiểm soát vận hành','Chủ động duy trì chất lượng', '<div class="action-grid"><div class="action-card"><strong>Bảo trì cơ sở</strong><p>Chi phí $2,500 · +22 điểm tình trạng.</p><button class="button button-secondary" data-action="maintenance">Bảo trì</button></div><div class="action-card"><strong>Đào tạo dịch vụ</strong><p>Chi phí $1,800 · +8 điểm dịch vụ.</p><button class="button button-secondary" data-action="training">Đào tạo</button></div><div class="action-card"><strong>Tiếp tế kho</strong><p>Chi phí $900 · khôi phục vật tư.</p><button class="button button-secondary" data-action="stock">Nhập vật tư</button></div><div class="action-card"><strong>Tiết kiệm năng lượng</strong><p>Chi phí $1,200 · +18 điểm năng lượng.</p><button class="button button-secondary" data-action="energy">Tối ưu điện</button></div></div>','span-6')+
 panel('Cơ sở dịch vụ','Đầu tư tiện ích để tăng doanh thu và sức hút','<div class="action-grid">'+fac+'</div>','span-6')+
 '</div>';
}
function renderStaff(){
 const rows=Object.entries(roles).map(([id,r])=>{
  const count=state.staff[id];
  return '<tr><td><strong>'+r.name+'</strong><div class="muted">'+money(r.salary)+'/người/tháng</div></td><td>'+count+'</td><td>'+money(r.salary*count/30)+'/ngày</td><td><button class="mini-button" data-action="hire" data-role="'+id+'">Tuyển</button> <button class="mini-button" data-action="fire" data-role="'+id+'" '+(count<=0?'disabled':'')+'>Giảm</button></td></tr>'
 }).join('');
 return '<div class="dashboard-grid">'+
 metric('Tổng nhân sự',number(staffCount()),'Trên toàn khách sạn')+
 metric('Quỹ lương/ngày',money(dailyPayroll()),'Phân bổ theo ngày')+
 metric('Tinh thần',Math.round(state.morale)+'/100','Ảnh hưởng năng suất','gold')+
 metric('Năng lực quản lý',state.staff.manager,'Quản lý đang làm việc')+
 panel('Biên chế nhân sự','Tuyển dụng hoặc điều chỉnh số lượng nhân viên','<div class="table-wrap"><table><thead><tr><th>BỘ PHẬN</th><th>NHÂN SỰ</th><th>CHI PHÍ ƯỚC TÍNH</th><th>THAO TÁC</th></tr></thead><tbody>'+rows+'</tbody></table></div>','span-12')+
 panel('Chính sách nhân sự','Các quyết định tác động đến hiệu suất', '<div class="action-grid"><div class="action-card"><strong>Thưởng hiệu suất</strong><p>Chi $1,500 để tăng tinh thần nhân viên.</p><button class="button button-secondary" data-action="bonus">Chi thưởng</button></div><div class="action-card"><strong>Đào tạo toàn bộ</strong><p>Chi $2,800 để tăng dịch vụ và năng suất.</p><button class="button button-secondary" data-action="staff-training">Tổ chức đào tạo</button></div></div>','span-12')+
 '</div>';
}
function renderMarket(){
 const demand=guestDemand();
 const facilitiesCount=Object.values(state.facilities).filter(Boolean).length;
 const priceIndex=clamp(100+(state.reputation-60)*.6+(state.stars-2)*7,70,145);
 return '<div class="dashboard-grid">'+
 metric('Nhu cầu dự kiến',number(demand)+' khách/ngày','Ước tính theo danh tiếng và mùa')+
 metric('Chỉ số giá thị trường',Math.round(priceIndex),'100 = mức trung bình','gold')+
 metric('Cạnh tranh',state.stars>=4?'Cao':'Trung bình','Dựa trên cấp độ khách sạn')+
 metric('Tiện ích đang mở',facilitiesCount+'/5','Tăng sức cạnh tranh')+
 panel('Chiến lược thương mại','Quảng bá thương hiệu và tối ưu công suất','<div class="action-grid"><div class="action-card"><strong>Quảng cáo địa phương</strong><p>$2,000 · tăng nhu cầu 15% trong 3 ngày.</p><button class="button button-secondary" data-action="campaign" data-kind="local">Chạy quảng cáo</button></div><div class="action-card"><strong>Chiến dịch cao cấp</strong><p>$5,500 · tăng nhu cầu 32% trong 4 ngày.</p><button class="button button-secondary" data-action="campaign" data-kind="premium">Triển khai</button></div><div class="action-card"><strong>Điều chỉnh giá linh hoạt</strong><p>Giá cao tăng biên lợi nhuận nhưng có thể giảm nhu cầu.</p><button class="button button-secondary" data-action="pricing">Quản lý giá</button></div><div class="action-card"><strong>Hợp đồng doanh nghiệp</strong><p>Cam kết phục vụ đoàn khách để nhận thưởng.</p><button class="button button-secondary" data-action="contract">Tìm hợp đồng</button></div></div>','span-7')+
 panel('Chỉ số thị trường','Các yếu tố đang tác động đến khách sạn','<div class="stat-list">'+bar('Danh tiếng',state.reputation)+bar('Chất lượng dịch vụ',state.service,'blue')+bar('Tiện nghi',Math.min(100,facilitiesCount*20+20),'gold')+bar('Giá cạnh tranh',priceIndex,'blue')+'</div><div class="inline-note">Nhu cầu thay đổi theo mùa, danh tiếng, hạng sao, marketing và chương trình khách hàng thân thiết.</div>','span-5')+
 '</div>';
}
function renderFinance(){
 const assets=state.cash+totalRooms()*9000+Object.entries(state.facilities).filter(([,v])=>v).reduce((a,[id])=>a+facilities[id].cost*.6,0);
 const net=assets-state.debt;
 const rows=state.history.slice(0,10).map(x=>'<tr><td>Ngày '+x.day+'</td><td>'+money(x.revenue)+'</td><td>'+money(x.expenses)+'</td><td class="'+(x.profit>=0?'positive':'negative')+'">'+money(x.profit)+'</td><td>'+Math.round(x.occupancy)+'%</td></tr>').join('');
 return '<div class="dashboard-grid">'+
 metric('Tiền mặt',money(state.cash),'Số dư khả dụng',state.cash>=0?'positive':'negative')+
 metric('Khoản vay',money(state.debt),'Dư nợ hiện tại','gold')+
 metric('Giá trị tài sản ròng',money(net),'Ước tính tài sản trừ nợ')+
 metric('Lợi nhuận trọn đời',money(state.lifetime.profit),'Tổng lợi nhuận ghi nhận',state.lifetime.profit>=0?'positive':'negative')+
 panel('Quản lý vốn','Vay vốn hoặc trả nợ để điều tiết dòng tiền','<div class="action-grid"><div class="action-card"><strong>Vay vốn mở rộng</strong><p>Vay $10,000 · lãi suất 0.08%/ngày.</p><button class="button button-secondary" data-action="loan">Vay $10,000</button></div><div class="action-card"><strong>Trả nợ</strong><p>Thanh toán $5,000 dư nợ gốc.</p><button class="button button-secondary" data-action="repay" '+(state.debt<=0?'disabled':'')+'>Trả $5,000</button></div></div><div class="notice info" style="margin-top:12px">Lãi vay được tính khi chốt ngày. Hãy duy trì dòng tiền dương để tránh mất khả năng thanh toán.</div>','span-5')+
 panel('Báo cáo kết quả kinh doanh','Tổng hợp các ngày đã chốt','<div class="table-wrap"><table><thead><tr><th>KỲ</th><th>DOANH THU</th><th>CHI PHÍ</th><th>LỢI NHUẬN</th><th>CÔNG SUẤT</th></tr></thead><tbody>'+rows+'</tbody></table></div>','span-7')+
 '</div>';
}
function renderResearch(){
 const cards=research.map(r=>{
  const done=state.researched.includes(r.id);
  return '<div class="action-card"><div class="row-between"><strong>'+r.name+'</strong><span class="tag '+(done?'good':'warn')+'">'+(done?'Đã nghiên cứu':'Chưa mở khóa')+'</span></div><p>'+r.desc+'</p><p class="muted">Ngân sách: '+money(r.cost)+'</p><button class="button button-secondary" data-action="research" data-id="'+r.id+'" '+(done?'disabled':'')+'>'+(done?'Hoàn tất':'Đầu tư nghiên cứu')+'</button></div>'
 }).join('');
 const unlocks='<div class="stat-list">'+bar('Revenue Management',state.bonuses.yield*100,'gold')+bar('Service Excellence',state.bonuses.service,'blue')+bar('Smart Operations',state.bonuses.automation*100,'gold')+bar('Loyalty Program',state.bonuses.loyalty*100)+bar('Green Hotel',state.bonuses.green*100,'blue')+'</div>';
 return '<div class="dashboard-grid">'+
 metric('Cấp độ công ty',state.level,'Kinh nghiệm '+number(state.experience))+
 metric('Hạng khách sạn',state.stars+' sao','Tăng theo cấp độ')+
 metric('Nghiên cứu hoàn tất',state.researched.length+'/'+research.length,'Năng lực cạnh tranh')+
 metric('Tài sản phòng',number(totalRooms()),'Tổng phòng đang sở hữu')+
 panel('Danh mục nghiên cứu','Đầu tư để cải thiện hiệu quả dài hạn','<div class="action-grid">'+cards+'</div>','span-7')+
 panel('Công nghệ đã sở hữu','Các chỉ số cộng thêm từ nghiên cứu',unlocks,'span-5')+
 '</div>';
}
function render(){
 const titles={overview:['BẢNG ĐIỀU KHIỂN','Tổng quan khách sạn','Theo dõi hoạt động và đưa ra quyết định điều hành.'],rooms:['QUẢN LÝ TÀI SẢN','Phòng & đặt chỗ','Kiểm soát sức chứa, giá phòng và trải nghiệm lưu trú.'],operations:['VẬN HÀNH','Vận hành khách sạn','Duy trì chất lượng dịch vụ và hiệu suất cơ sở.'],staff:['QUẢN TRỊ NHÂN SỰ','Nhân sự','Tuyển dụng, phân bổ và phát triển đội ngũ.'],market:['THƯƠNG MẠI','Thị trường','Điều chỉnh chiến lược giá và nhu cầu khách hàng.'],finance:['TÀI CHÍNH','Tài chính','Theo dõi dòng tiền, khoản vay và hiệu quả kinh doanh.'],research:['PHÁT TRIỂN','Nghiên cứu & mở rộng','Đầu tư năng lực dài hạn cho tập đoàn khách sạn.']};
 const t=titles[currentTab];$('page-kicker').textContent=t[0];$('page-title').textContent=t[1];$('page-subtitle').textContent=t[2];
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===currentTab));
 const renderers={overview:renderOverview,rooms:renderRooms,operations:renderOperations,staff:renderStaff,market:renderMarket,finance:renderFinance,research:renderResearch};
 $('tab-content').innerHTML=renderers[currentTab]();
 $('top-cash').textContent=money(state.cash);$('top-day').textContent=String(state.day).padStart(2,'0');$('top-clock').textContent=fmtTime(state.minute);
 $('hotel-name').textContent=state.hotelName;$('hotel-stars').textContent='★'.repeat(state.stars)+'☆'.repeat(5-state.stars);$('sidebar-reputation').textContent=Math.round(state.reputation)+'/100';$('sidebar-reputation-bar').style.width=state.reputation+'%';
 $('simulation-status').textContent=state.paused?'Mô phỏng đang tạm dừng':'Mô phỏng đang chạy';
 $('pause-btn').textContent=state.paused?'Tiếp tục':'Tạm dừng';$('speed-btn').textContent='Tốc độ: '+state.speed+'×';
}
function canSpend(amount){if(state.cash<amount){toast('Không đủ tiền mặt cho quyết định này.','error');return false}return true}
function spend(amount,reason){state.cash-=amount;state.today.expenses+=amount;log(reason+' · −'+money(amount)+'.')}
function openModal(title,body,buttons=''){
 $('modal-content').innerHTML='<h2>'+title+'</h2>'+body+(buttons?'<div class="modal-actions">'+buttons+'</div>':'');
 $('modal').showModal();
}
function showPriceModal(type){
 const r=roomTypes[type];
 openModal('Điều chỉnh giá '+r.label,'<p>Giá hiện tại: '+money(state.prices[type])+' mỗi đêm. Giá cao có thể giảm nhu cầu nếu vượt quá mức thị trường.</p><label class="field">Giá mới ($/đêm)<input id="price-input" type="number" min="20" max="1500" value="'+state.prices[type]+'"></label>','<button class="button button-secondary" value="cancel">Hủy</button><button class="button button-primary" id="confirm-price" type="button">Áp dụng</button>');
 $('confirm-price').onclick=()=>{const value=Number($('price-input').value);if(!Number.isFinite(value)||value<20||value>1500){toast('Giá phải từ $20 đến $1,500.','error');return}state.prices[type]=Math.round(value);log('Cập nhật giá '+r.label+' thành '+money(value)+'/đêm.');$('modal').close();saveState(true);render();toast('Đã cập nhật giá phòng.','success')};
}
function buildRoom(type){
 const r=roomTypes[type];if(!canSpend(r.build))return;
 spend(r.build,'Xây thêm 1 phòng '+r.label);state.rooms[type]++;state.condition=clamp(state.condition-1,0,100);saveState(true);render();toast('Đã mở rộng thêm một phòng '+r.label+'.','success');
}
function hire(role){
 const r=roles[role],cost=r.salary*1.5;if(!canSpend(cost))return;
 spend(cost,'Tuyển nhân viên '+r.name);state.staff[role]++;state.morale=clamp(state.morale+1,0,100);saveState(true);render();
}
function fire(role){
 if(state.staff[role]<=0)return;state.staff[role]--;state.morale=clamp(state.morale-2,0,100);log('Giảm một nhân sự bộ phận '+roles[role].name+'.');saveState(true);render();
}
function doAction(action,el){
 const id=el.dataset.id,type=el.dataset.type,role=el.dataset.role;
 switch(action){
 case 'price':showPriceModal(type);return;
 case 'pricing':showPriceModal('standard');return;
 case 'build-room':buildRoom(type);return;
 case 'hire':hire(role);return;
 case 'fire':fire(role);return;
 case 'facility':{
  const f=facilities[id];if(state.facilities[id]||!canSpend(f.cost))return;
  spend(f.cost,'Đầu tư '+f.name);state.facilities[id]=true;state.service=clamp(state.service+f.bonus*.35,0,100);saveState(true);render();break;
 }
 case 'maintenance':if(!canSpend(2500))return;spend(2500,'Bảo trì cơ sở');state.condition=clamp(state.condition+22,0,100);state.cleanliness=clamp(state.cleanliness+5,0,100);saveState(true);render();break;
 case 'training':if(!canSpend(1800))return;spend(1800,'Đào tạo dịch vụ');state.service=clamp(state.service+8,0,100);state.morale=clamp(state.morale+2,0,100);saveState(true);render();break;
 case 'stock':if(!canSpend(900))return;spend(900,'Nhập vật tư');state.stock=clamp(state.stock+35,0,100);saveState(true);render();break;
 case 'energy':if(!canSpend(1200))return;spend(1200,'Tối ưu năng lượng');state.energy=clamp(state.energy+18,0,100);state.bonuses.green=Math.max(state.bonuses.green,.04);saveState(true);render();break;
 case 'bonus':if(!canSpend(1500))return;spend(1500,'Thưởng hiệu suất');state.morale=clamp(state.morale+12,0,100);saveState(true);render();break;
 case 'staff-training':if(!canSpend(2800))return;spend(2800,'Đào tạo toàn bộ nhân viên');state.service=clamp(state.service+5,0,100);state.morale=clamp(state.morale+8,0,100);saveState(true);render();break;
 case 'marketing':runCampaign('local');break;
 case 'campaign':runCampaign(el.dataset.kind);break;
 case 'contract':offerContract();break;
 case 'loan':state.cash+=10000;state.debt+=10000;log('Giải ngân khoản vay $10,000.');saveState(true);render();break;
 case 'repay':if(!canSpend(5000)||state.debt<=0)return;const paid=Math.min(5000,state.debt);state.cash-=paid;state.debt-=paid;log('Trả nợ gốc '+money(paid)+'.');saveState(true);render();break;
 case 'research':{
  const item=research.find(x=>x.id===id);if(!item||state.researched.includes(id)||!canSpend(item.cost))return;
  spend(item.cost,'Nghiên cứu '+item.name);state.researched.push(id);item.effect(state);saveState(true);render();toast('Đã hoàn tất '+item.name+'.','success');break;
 }
 }
}
function runCampaign(kind){
 const cfg=kind==='premium'?{cost:5500,bonus:.32,days:4,name:'Chiến dịch cao cấp'}:{cost:2000,bonus:.15,days:3,name:'Quảng cáo địa phương'};
 if(!canSpend(cfg.cost))return;spend(cfg.cost,cfg.name);state.marketing=cfg.bonus;state.marketingUntil=state.day+cfg.days;log(cfg.name+' đang hoạt động trong '+cfg.days+' ngày.');saveState(true);render();toast('Chiến dịch đã được triển khai.','success');
}
function offerContract(){
 if(state.contract){toast('Bạn đang có một hợp đồng chưa kết thúc.','error');return}
 const target=Math.max(5,Math.ceil(totalRooms()*.45));state.contract={target,progress:0,reward:target*210,due:state.day+3};
 log('Nhận hợp đồng doanh nghiệp: phục vụ '+target+' lượt khách trong 3 ngày.');
 toast('Hợp đồng mới: mục tiêu '+target+' lượt khách.','success');saveState(true);render();
}
function advanceSpeed(){
 state.speed=state.speed===1?2:state.speed===2?4:1;render();
}
function togglePause(){
 state.paused=!state.paused;render();saveState(true);
}
function tick(){
 if(state.paused)return;
 const loops=state.speed;
 for(let i=0;i<loops;i++)simulateMinute();
 const now=Date.now();if(now-lastRender>1200){lastRender=now;render();saveState(true)}
}
function bindEvents(){
 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{currentTab=b.dataset.tab;render()}));
 $('tab-content').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)doAction(b.dataset.action,b)});
 $('pause-btn').addEventListener('click',togglePause);
 $('speed-btn').addEventListener('click',advanceSpeed);
 $('close-day-btn').addEventListener('click',()=>{if(confirm('Chốt sổ ngày hiện tại và chuyển sang ngày tiếp theo?'))closeDay(false)});
 $('save-btn').addEventListener('click',()=>saveState(false));
 $('modal').addEventListener('click',e=>{if(e.target===$('modal'))$('modal').close()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState(true)});
 window.addEventListener('beforeunload',()=>saveState(true));
}
function init(){
 state=loadState();applyOffline();
 if(!state.log.length)log('Chào mừng đến với Hotel Empire. Hãy quản lý khách sạn đầu tiên của bạn.');
 bindEvents();render();saveState(true);
 timer=setInterval(tick,1000);
}
init();
})();