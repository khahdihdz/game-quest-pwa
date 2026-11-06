'use strict';
(()=>{
const $=id=>document.getElementById(id), KEY='hotel-underworld-save-v1';
const fmt=n=>Math.round(n).toLocaleString('vi-VN')+' ₫', clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const pick=a=>a[Math.floor(Math.random()*a.length)], esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rooms={standard:{name:'Phòng tiêu chuẩn',rate:850000,cost:18000000},deluxe:{name:'Phòng cao cấp',rate:1350000,cost:29000000},suite:{name:'Phòng hạng sang',rate:2400000,cost:52000000},penthouse:{name:'Phòng tổng thống',rate:4200000,cost:95000000}};
const roles={reception:{name:'Lễ tân',salary:9500000},housekeeping:{name:'Buồng phòng',salary:8200000},security:{name:'An ninh',salary:12500000},manager:{name:'Quản lý',salary:18000000}};
const factions=[{id:'velvet',name:'Hội Nhung Đêm',desc:'Những vị khách kín tiếng, coi trọng sự riêng tư.',risk:7},{id:'harbor',name:'Hội Bến Cảng',desc:'Một mạng lưới thương nhân bí ẩn trong thế giới hư cấu.',risk:12},{id:'patron',name:'Giới Bảo Trợ',desc:'Giới đầu tư kín tiếng, luôn muốn đổi lợi ích lấy ảnh hưởng.',risk:9}];
const fresh=()=>({day:1,hour:8,paused:false,speed:1,cash:3500000000,debt:900000000,rep:62,suspicion:14,stars:2,rooms:{standard:12,deluxe:5,suite:1,penthouse:0},prices:{standard:850000,deluxe:1350000,suite:2400000,penthouse:4200000},staff:{reception:3,housekeeping:4,security:1,manager:1},guests:[],nextGuest:1,quality:72,clean:84,condition:91,morale:76,cover:68,network:18,activeDeal:null,history:[],log:[],event:null,last:Date.now(),today:{revenue:0,cost:0,arrivals:0},lifetime:{revenue:0,guests:0,days:0},ending:null});
let s,tab='overview',timer,toastTimer;
function note(msg,type=''){s.log.unshift({day:s.day,hour:s.hour,msg,type});s.log=s.log.slice(0,60)}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
function totalRooms(){return Object.values(s.rooms).reduce((a,b)=>a+b,0)}
function occupied(){return s.guests.length}
function freeRooms(){return Math.max(0,totalRooms()-occupied())}
function occupancy(){return totalRooms()?occupied()/totalRooms():0}
function payroll(){return Object.entries(s.staff).reduce((n,[k,v])=>n+v*roles[k].salary/30,0)}
function save(silent=true){s.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(s));if(!silent)toast('Đã lưu tiến trình.')}catch{toast('Thiết bị không cho phép lưu dữ liệu.')}}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(!v)return fresh();const b=fresh();return {...b,...v,rooms:{...b.rooms,...v.rooms},prices:{...b.prices,...v.prices},staff:{...b.staff,...v.staff},today:{...b.today,...v.today},lifetime:{...b.lifetime,...v.lifetime}}}catch{return fresh()}}
function logPanel(){return s.log.slice(0,9).map(x=>'<div class="feed-item"><time>D'+x.day+' · '+String(x.hour).padStart(2,'0')+':00</time><p>'+esc(x.msg)+'</p></div>').join('')||'<div class="empty">Chưa có hoạt động.</div>'}
function metric(label,value,sub,tone=''){return '<div class="metric"><label>'+label+'</label><strong class="'+tone+'">'+value+'</strong><small>'+sub+'</small></div>'}
function panel(title,sub,body,size='s6'){return '<section class="panel '+size+'"><div class="panel-head"><div><h3>'+title+'</h3><div class="sub">'+sub+'</div></div></div>'+body+'</section>'}
function meter(label,value,color=''){return '<div class="meter-row"><span>'+label+'</span><div class="track"><i class="'+color+'" style="width:'+clamp(value)+'%"></i></div><b>'+Math.round(value)+'</b></div>'}
const tabs={overview:['BẢNG ĐIỀU KHIỂN','Tổng quan khách sạn','Một khách sạn bình thường. Ít nhất là trên giấy tờ.'],rooms:['LƯU TRÚ','Phòng & khách','Công suất, giá phòng và danh sách khách đang lưu trú.'],staff:['NHÂN SỰ','Đội ngũ vận hành','Tuyển đúng người, giữ bí mật và kiểm soát chi phí.'],operations:['HẬU TRƯỜNG','Vận hành khách sạn','Chất lượng dịch vụ, vệ sinh, bảo trì và mức độ che chắn.'],underworld:['HỒ SƠ MẬT','Mạng lưới bí mật','Các thỏa thuận hoàn toàn hư cấu, luôn đi kèm rủi ro.'],finance:['PHÒNG TÀI CHÍNH','Tài chính & đầu tư','Dòng tiền, khoản vay và quyết định mở rộng.'],records:['LƯU TRỮ','Hồ sơ & bản lưu','Quản lý các khe lưu, xuất hoặc nhập tiến trình.']};
function render(){
 $('cash').textContent=fmt(s.cash);$('day').textContent=String(s.day).padStart(2,'0');$('clock').textContent=String(s.hour).padStart(2,'0')+':00';
 $('stars').textContent='★'.repeat(s.stars)+'☆'.repeat(5-s.stars);$('rep').textContent=Math.round(s.rep)+'/100';$('repbar').style.width=s.rep+'%';
 $('pause').textContent=s.paused?'Tiếp tục':'Tạm dừng';$('runstate').textContent=s.paused?'MÔ PHỎNG TẠM DỪNG':'MÔ PHỎNG ĐANG CHẠY';$('status-line').textContent=s.paused?'Tạm dừng':s.ending?'Kết thúc':'Đang vận hành';
 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const [k,t,d]=tabs[tab];$('kicker').textContent=k;$('title').textContent=t;$('subtitle').textContent=d;
 $('speed').textContent='Tốc độ '+s.speed+'×';$('endday').disabled=!!s.ending;
 $('content').innerHTML=({overview,rooms:roomsPage,staff:staffPage,operations:operationsPage,underworld:underworldPage,finance:financePage,records:recordsPage})[tab]();
 if(tab==='records')updateSlots();
}
function overview(){
 const profit=s.today.revenue-s.today.cost,activity=s.event?'<div class="notice">'+esc(s.event.title)+' — '+esc(s.event.text)+'</div>':'<div class="notice info">Đêm nay có vẻ yên tĩnh. Đừng chủ quan.</div>';
 const deal=s.activeDeal?'<div class="notice danger">Thỏa thuận đang mở: '+esc(s.activeDeal.name)+' · còn '+s.activeDeal.left+' ngày.</div>':'<div class="notice info">Không có thỏa thuận bí mật nào đang chờ xử lý.</div>';
 return '<div class="grid">'+metric('Doanh thu hôm nay',fmt(s.today.revenue),'Thu từ khách lưu trú','green')+metric('Lợi nhuận tạm tính',(profit<0?'−':'')+fmt(Math.abs(profit)),'Sau chi phí vận hành',profit>=0?'green':'red')+metric('Công suất phòng',Math.round(occupancy()*100)+'%',occupied()+'/'+totalRooms()+' phòng','gold')+metric('Áp lực điều tra',Math.round(s.suspicion)+'/100','Càng cao càng nguy hiểm',s.suspicion>65?'red':'gold')+
 panel('Chỉ số khách sạn','Những yếu tố tác động tới trải nghiệm và hoạt động','<div class="meter-list">'+meter('Danh tiếng',s.rep)+meter('Chất lượng',s.quality,'green')+meter('Vệ sinh',s.clean,'green')+meter('Cơ sở vật chất',s.condition)+meter('Tinh thần',s.morale)+meter('Vỏ bọc kinh doanh',s.cover,'green')+'</div>','s5')+
 panel('Tình hình trong ngày','Các diễn biến đáng chú ý',activity+deal+'<div class="feed">'+logPanel()+'</div>','s7')+
 panel('Quyết định nhanh','Các hành động điều hành thường dùng','<div class="actions"><div class="action-card"><b>Chiến dịch quảng bá</b><p>Tăng khách mới và cải thiện hình ảnh công khai.</p><button class="btn" data-act="marketing">Chi 25 triệu</button></div><div class="action-card"><b>Bảo trì khẩn cấp</b><p>Cải thiện cơ sở vật chất và chất lượng.</p><button class="btn" data-act="maintenance">Chi 18 triệu</button></div><div class="action-card"><b>Kiểm tra nội bộ</b><p>Giảm áp lực và củng cố quy trình.</p><button class="btn" data-act="audit">Chi 12 triệu</button></div><div class="action-card"><b>Đặt giá linh hoạt</b><p>Điều chỉnh mức giá phòng theo phân khúc.</p><button class="btn" data-act="pricing">Điều chỉnh</button></div></div>','s12')+'</div>';
}
function roomsPage(){
 const rows=Object.entries(s.rooms).map(([id,n])=>'<tr><td><b>'+rooms[id].name+'</b></td><td>'+n+'</td><td>'+fmt(s.prices[id])+'</td><td>'+fmt(rooms[id].cost)+'</td><td><button class="mini" data-act="build" data-id="'+id+'">Xây thêm</button> <button class="mini" data-act="price" data-id="'+id+'">Đổi giá</button></td></tr>').join('');
 const guests=s.guests.map(g=>'<tr><td>'+esc(g.name)+'</td><td>'+rooms[g.type].name+'</td><td>'+g.nights+' đêm</td><td>'+fmt(g.rate)+'/đêm</td><td><span class="tag good">Đang ở</span></td></tr>').join('')||'<tr><td colspan="5">Chưa có khách lưu trú.</td></tr>';
 return '<div class="grid">'+metric('Tổng số phòng',totalRooms(),'Sức chứa hiện tại')+metric('Phòng đang có khách',occupied(),'Khách lưu trú')+metric('Phòng còn trống',freeRooms(),'Có thể nhận khách')+metric('Giá phòng trung bình',fmt(Object.values(s.prices).reduce((a,b)=>a+b,0)/4),'Theo cấu hình')+
 panel('Danh mục phòng','Đầu tư thêm phòng để tăng công suất','<div class="table-wrap"><table><thead><tr><th>LOẠI PHÒNG</th><th>SỐ LƯỢNG</th><th>GIÁ/ĐÊM</th><th>CHI PHÍ XÂY</th><th>HÀNH ĐỘNG</th></tr></thead><tbody>'+rows+'</tbody></table></div>','s12')+
 panel('Khách lưu trú','Khách hàng hiện tại của khách sạn','<div class="table-wrap"><table><thead><tr><th>KHÁCH</th><th>HẠNG PHÒNG</th><th>CÒN LẠI</th><th>GIÁ</th><th>TRẠNG THÁI</th></tr></thead><tbody>'+guests+'</tbody></table></div>','s12')+'</div>';
}
function staffPage(){
 const rows=Object.entries(s.staff).map(([id,n])=>'<tr><td><b>'+roles[id].name+'</b></td><td>'+n+'</td><td>'+fmt(roles[id].salary)+'</td><td><button class="mini" data-act="hire" data-id="'+id+'">Tuyển +1</button> <button class="mini" data-act="fire" data-id="'+id+'">Giảm -1</button></td></tr>').join('');
 return '<div class="grid">'+metric('Tổng nhân sự',Object.values(s.staff).reduce((a,b)=>a+b,0),'Đang làm việc')+metric('Quỹ lương/ngày',fmt(payroll()),'Chi phí nhân sự')+metric('Tinh thần',Math.round(s.morale)+'/100','Ảnh hưởng chất lượng')+metric('An ninh',s.staff.security+' người','Bảo vệ khách và tài sản')+panel('Đội ngũ','Điều chỉnh quy mô theo công suất','<div class="table-wrap"><table><thead><tr><th>BỘ PHẬN</th><th>NHÂN SỰ</th><th>LƯƠNG/THÁNG</th><th>THAO TÁC</th></tr></thead><tbody>'+rows+'</tbody></table></div>','s12')+panel('Chính sách nhân sự','Đầu tư vào sự ổn định dài hạn','<div class="actions"><div class="action-card"><b>Thưởng động viên</b><p>+8 tinh thần, giảm nguy cơ sự cố.</p><button class="btn" data-act="bonus">Chi 15 triệu</button></div><div class="action-card"><b>Đào tạo nghiệp vụ</b><p>+6 chất lượng dịch vụ.</p><button class="btn" data-act="training">Chi 22 triệu</button></div></div>','s12')+'</div>';
}
function operationsPage(){
 return '<div class="grid">'+metric('Chất lượng dịch vụ',Math.round(s.quality)+'/100','Đánh giá của khách')+metric('Vệ sinh',Math.round(s.clean)+'/100','Tiêu chuẩn phòng')+metric('Cơ sở vật chất',Math.round(s.condition)+'/100','Bảo trì định kỳ')+metric('Vỏ bọc',Math.round(s.cover)+'/100','Hình ảnh khách sạn','green')+panel('Bảo dưỡng và quy trình','Các hoạt động cải thiện chất lượng','<div class="actions"><div class="action-card"><b>Tổng vệ sinh</b><p>Khôi phục vệ sinh toàn khách sạn.</p><button class="btn" data-act="clean">Chi 8 triệu</button></div><div class="action-card"><b>Bảo trì định kỳ</b><p>Khôi phục cơ sở vật chất.</p><button class="btn" data-act="maintenance">Chi 18 triệu</button></div><div class="action-card"><b>Chuẩn hóa dịch vụ</b><p>Tăng chất lượng và danh tiếng.</p><button class="btn" data-act="service">Chi 20 triệu</button></div><div class="action-card"><b>Kiểm tra nội bộ</b><p>Giảm áp lực điều tra, củng cố hồ sơ.</p><button class="btn" data-act="audit">Chi 12 triệu</button></div></div>','s7')+panel('Chỉ số vận hành','Theo dõi trước khi chúng trở thành khủng hoảng','<div class="meter-list">'+meter('Chất lượng',s.quality)+meter('Vệ sinh',s.clean)+meter('Cơ sở vật chất',s.condition)+meter('Tinh thần',s.morale)+meter('Vỏ bọc',s.cover)+meter('Áp lực điều tra',s.suspicion,'red')+'</div>','s5')+'</div>';
}
function underworldPage(){
 const cards=factions.map(f=>'<article class="contract-card"><span class="tag">RỦI RO '+f.risk+'/100</span><h4>'+f.name+'</h4><p>'+f.desc+'</p><p>Thưởng mô phỏng: '+fmt(65000000+f.risk*1800000)+' · tác động áp lực +'+f.risk+'</p><button class="btn" data-act="deal" data-id="'+f.id+'" '+(s.activeDeal?'disabled':'')+'>Nhận thỏa thuận hư cấu</button></article>').join('');
 return '<div class="grid">'+metric('Mạng lưới',Math.round(s.network)+'/100','Mức độ ảnh hưởng','gold')+metric('Áp lực điều tra',Math.round(s.suspicion)+'/100','Chỉ số rủi ro',s.suspicion>65?'red':'gold')+metric('Vỏ bọc',Math.round(s.cover)+'/100','Hình ảnh khách sạn','green')+metric('Thỏa thuận',s.activeDeal?'Đang hoạt động':'Không có','Mỗi lựa chọn đều có hệ quả')+panel('Những mối quan hệ kín','Các hội nhóm và giao kèo chỉ tồn tại trong cốt truyện trò chơi','<div class="notice danger">Đây là hệ thống lựa chọn hư cấu phục vụ trò chơi, không mô tả hay hướng dẫn hành vi phạm pháp ngoài đời.</div><div class="grid" style="margin-top:12px">'+cards+'</div>','s12')+panel('Kiểm soát rủi ro','Giữ hoạt động kinh doanh hợp pháp đủ vững','<div class="actions"><div class="action-card"><b>Rút khỏi giao kèo</b><p>Chấm dứt thỏa thuận đang mở, mất một phần uy tín mạng lưới.</p><button class="btn danger" data-act="withdraw" '+(!s.activeDeal?'disabled':'')+'>Rút lui</button></div><div class="action-card"><b>Minh bạch hóa hoạt động</b><p>Giảm áp lực điều tra và tăng vỏ bọc kinh doanh.</p><button class="btn" data-act="transparency">Thực hiện · 16 triệu</button></div></div>','s12')+'</div>';
}
function financePage(){
 const hist=s.history.slice(0,8).map(h=>'<tr><td>Ngày '+h.day+'</td><td>'+fmt(h.revenue)+'</td><td>'+fmt(h.cost)+'</td><td class="'+(h.profit>=0?'green':'red')+'">'+fmt(h.profit)+'</td></tr>').join('')||'<tr><td colspan="4">Chưa có báo cáo.</td></tr>';
 return '<div class="grid">'+metric('Tiền mặt',fmt(s.cash),'Ngân quỹ hiện tại')+metric('Khoản vay',fmt(s.debt),'Lãi suất giả lập 0,08%/ngày')+metric('Doanh thu tích lũy',fmt(s.lifetime.revenue),'Từ ngày bắt đầu')+metric('Ngày đã vận hành',s.lifetime.days,'Ngày hoàn tất')+panel('Quản lý vốn','Đầu tư, trả nợ và bảo toàn dòng tiền','<div class="actions"><div class="action-card"><b>Trả nợ 50 triệu</b><p>Giảm khoản vay và chi phí lãi.</p><button class="btn" data-act="repay">Thanh toán</button></div><div class="action-card"><b>Gọi vốn bổ sung</b><p>Vay thêm 200 triệu, tăng áp lực tài chính.</p><button class="btn" data-act="loan">Vay vốn</button></div><div class="action-card"><b>Mở rộng cơ sở</b><p>Mua thêm một khu nhà phụ với giá 450 triệu.</p><button class="btn" data-act="branch">Mở chi nhánh</button></div></div>','s5')+panel('Báo cáo theo ngày','Lịch sử kết quả kinh doanh','<div class="table-wrap"><table><thead><tr><th>NGÀY</th><th>DOANH THU</th><th>CHI PHÍ</th><th>LỢI NHUẬN</th></tr></thead><tbody>'+hist+'</tbody></table></div>','s7')+'</div>';
}
function recordsPage(){
 return '<div class="grid">'+panel('Ô lưu tiến trình','Lưu nhiều chiến dịch trên cùng thiết bị','<div class="actions">'+[1,2,3].map(n=>'<div class="action-card"><b>Ô lưu '+n+'</b><p id="slot-'+n+'">Chưa có dữ liệu</p><button type="button" class="btn" data-act="slot-save" data-id="'+n+'">Lưu vào khe</button><button type="button" class="btn" data-act="slot-load" data-id="'+n+'">Tải bản lưu</button></div>').join('')+'</div>','s12')+panel('Sao lưu dữ liệu','Xuất tệp dữ liệu hoặc nhập tiến trình đã lưu','<div class="actions"><div class="action-card"><b>Xuất tiến trình</b><p>Tạo bản sao lưu có thể chuyển sang thiết bị khác.</p><button class="btn" data-act="export">Xuất dữ liệu</button></div><div class="action-card"><b>Nhập tiến trình</b><p>Khôi phục từ file JSON đã xuất.</p><button class="btn" data-act="import">Chọn tệp dữ liệu</button></div><div class="action-card"><b>Bắt đầu chiến dịch mới</b><p>Xóa tiến trình hiện tại trên thiết bị này.</p><button class="btn danger" data-act="reset">Xóa và chơi lại</button></div></div>','s12')+'</div>';
}
function pay(amount){if(s.cash<amount){toast('Không đủ tiền mặt.');return false}s.cash-=amount;s.today.cost+=amount;return true}
function doAction(act,el){
 const id=el.dataset.id;
 if(act==='build'){const r=rooms[id];if(!pay(r.cost))return;s.rooms[id]++;s.condition=clamp(s.condition-1);note('Hoàn thành xây dựng: '+r.name+'.');toast('Đã mở rộng khách sạn.')}
 else if(act==='price'){openPrice(id);return}
 else if(act==='hire'){if(!pay(roles[id].salary))return;s.staff[id]++;note('Tuyển thêm nhân sự bộ phận '+roles[id].name+'.')}
 else if(act==='fire'){if(s.staff[id]<=0){toast('Không còn nhân sự để giảm.');return}s.staff[id]--;s.morale=clamp(s.morale-2);note('Điều chỉnh nhân sự: '+roles[id].name+'.')}
 else if(act==='bonus'){if(!pay(15000000))return;s.morale=clamp(s.morale+8);note('Đã chi thưởng động viên nhân viên.')}
 else if(act==='training'){if(!pay(22000000))return;s.quality=clamp(s.quality+6);note('Đào tạo nghiệp vụ hoàn tất.')}
 else if(act==='marketing'){if(!pay(25000000))return;s.rep=clamp(s.rep+3);s.cover=clamp(s.cover+4);note('Chiến dịch quảng bá tăng nhận diện khách sạn.')}
 else if(act==='maintenance'){if(!pay(18000000))return;s.condition=clamp(s.condition+18);note('Đã bảo trì cơ sở vật chất.')}
 else if(act==='audit'){if(!pay(12000000))return;s.suspicion=clamp(s.suspicion-9);s.cover=clamp(s.cover+5);note('Kiểm tra nội bộ giúp hồ sơ vận hành rõ ràng hơn.')}
 else if(act==='clean'){if(!pay(8000000))return;s.clean=clamp(s.clean+18);note('Hoàn tất tổng vệ sinh.')}
 else if(act==='service'){if(!pay(20000000))return;s.quality=clamp(s.quality+9);s.rep=clamp(s.rep+1);note('Nâng cấp quy trình phục vụ.')}
 else if(act==='pricing'){openPrice('standard');return}
 else if(act==='deal'){if(s.activeDeal){toast('Đang có thỏa thuận chưa kết thúc.');return}const f=factions.find(x=>x.id===id);s.activeDeal={id:f.id,name:f.name,left:3,reward:65000000+f.risk*1800000,risk:f.risk};s.network=clamp(s.network+8);s.suspicion=clamp(s.suspicion+f.risk);note('Cốt truyện: nhận lời đề nghị từ '+f.name+'.','warning');toast('Một lựa chọn mới đã mở.')}
 else if(act==='withdraw'){if(!s.activeDeal)return;s.activeDeal=null;s.network=clamp(s.network-5);s.suspicion=clamp(s.suspicion-4);note('Đã rút khỏi thỏa thuận.','warning')}
 else if(act==='transparency'){if(!pay(16000000))return;s.suspicion=clamp(s.suspicion-12);s.cover=clamp(s.cover+10);note('Tăng cường minh bạch và chuẩn hóa hoạt động.')}
 else if(act==='repay'){const n=Math.min(50000000,s.debt);if(!pay(n))return;s.debt-=n;note('Đã thanh toán '+fmt(n)+' tiền gốc.')}
 else if(act==='loan'){s.cash+=200000000;s.debt+=200000000;s.suspicion=clamp(s.suspicion+2);note('Nhận khoản vay mới 200 triệu.','warning')}
 else if(act==='branch'){if(!pay(450000000))return;s.rooms.standard+=6;s.rooms.deluxe+=2;s.rep=clamp(s.rep+2);note('Mở khu lưu trú phụ: thêm 8 phòng.','success')}
 else if(act==='slot-save'){localStorage.setItem(KEY+'-slot-'+id,JSON.stringify(s));toast('Đã lưu vào khe '+id+'.')}
 else if(act==='slot-load'){const raw=localStorage.getItem(KEY+'-slot-'+id);if(!raw){toast('Ô lưu đang trống.');return}s=JSON.parse(raw);note('Đã tải khe lưu '+id+'.')}
 else if(act==='export'){const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ban-luu-de-che-khach-san.json';a.click();URL.revokeObjectURL(a.href);toast('Đã tạo bản sao lưu.')}
 else if(act==='import'){$('import-file').click();return}
 else if(act==='reset'){if(!confirm('Xóa tiến trình hiện tại và bắt đầu chiến dịch mới?'))return;localStorage.removeItem(KEY);s=fresh();note('Chiến dịch mới bắt đầu.')}
 render();save();
}
function openPrice(id){
 const r=rooms[id];$('modal-body').innerHTML='<h2>Điều chỉnh giá phòng</h2><p>'+r.name+' · giá hiện tại '+fmt(s.prices[id])+'</p><label class="field">Giá mới mỗi đêm<input id="new-price" type="number" min="100000" max="30000000" step="50000" value="'+s.prices[id]+'"></label><div class="modal-actions"><button type="button" class="btn primary" id="apply-price">Áp dụng</button><button type="button" class="btn" id="cancel-price">Hủy</button></div>';$('modal').showModal();$('cancel-price').onclick=()=>$('modal').close();$('apply-price').onclick=()=>{const v=Number($('new-price').value);if(v<100000||v>30000000){toast('Giá phòng không hợp lệ.');return}s.prices[id]=v;note('Điều chỉnh giá '+r.name+' thành '+fmt(v)+'.');$('modal').close();render();save()};
}
function newGuest(){
 if(freeRooms()<=0)return;
 const ids=Object.keys(s.rooms).filter(id=>s.rooms[id]>s.guests.filter(g=>g.type===id).length);
 if(!ids.length)return;
 const id=pick(ids),names=['An Nhiên','Minh Khang','Bảo Trâm','Quốc Huy','Hà My','Gia Bảo','Khánh An','Tuệ Lâm','Đình Phong','Mai Phương'];
 const guest={id:s.nextGuest++,name:pick(names),type:id,rate:s.prices[id],nights:1+Math.floor(Math.random()*3)};
 s.guests.push(guest);s.today.arrivals++;note('Khách '+guest.name+' nhận phòng '+rooms[id].name+'.');
}
function maybeEvent(){
 if(Math.random()>.42)return;
 const events=[
 {title:'Đánh giá tích cực',text:'Một vị khách để lại nhận xét tốt.',run:()=>{s.rep=clamp(s.rep+2);s.quality=clamp(s.quality+1)}},
 {title:'Đêm mưa lớn',text:'Chi phí bảo trì tăng nhẹ.',run:()=>{s.condition=clamp(s.condition-4);s.today.cost+=4500000;s.cash-=4500000}},
 {title:'Khách đoàn bất ngờ',text:'Nhu cầu lưu trú tăng trong ngày.',run:()=>{newGuest();newGuest()}},
 {title:'Tin đồn trên mạng',text:'Khách sạn bị chú ý nhiều hơn.',run:()=>{s.suspicion=clamp(s.suspicion+5);s.rep=clamp(s.rep-1)}},
 {title:'Nhân viên xuất sắc',text:'Tinh thần đội ngũ được cải thiện.',run:()=>{s.morale=clamp(s.morale+4)}}
 ];
 const e=pick(events);e.run();s.event={title:e.title,text:e.text};note('SỰ KIỆN: '+e.title+' — '+e.text,'event');
}
function closeDay(){
 const guests=[...s.guests],occ=occupancy();let revenue=0,remaining=[];
 for(const g of guests){revenue+=g.rate;s.lifetime.guests++;g.nights--;if(g.nights>0)remaining.push(g)}
 const variable=totalRooms()*240000+occupied()*90000,staffCost=payroll(),interest=s.debt*.0008,baseCost=variable+staffCost+interest,net=revenue-baseCost;
 s.cash+=revenue-baseCost;s.today.revenue+=revenue;s.today.cost+=baseCost;s.lifetime.revenue+=revenue;
 s.history.unshift({day:s.day,revenue,cost:baseCost,profit:net});s.history=s.history.slice(0,30);s.lifetime.days++;s.guests=remaining;
 if(s.activeDeal){s.activeDeal.left--;if(s.activeDeal.left<=0){s.cash+=s.activeDeal.reward;s.today.revenue+=s.activeDeal.reward;s.lifetime.revenue+=s.activeDeal.reward;s.rep=clamp(s.rep+2);note('Kết thúc thỏa thuận trong cốt truyện: nhận '+fmt(s.activeDeal.reward)+'.','event');s.activeDeal=null}}
 if(s.suspicion>=100){s.ending='Khách sạn bị đóng cửa trong cốt truyện';note('KẾT THÚC: áp lực điều tra vượt ngưỡng.','bad')}
 if(s.cash<0){s.ending='Phá sản';note('KẾT THÚC: khách sạn mất khả năng thanh toán.','bad')}
 s.day++;s.hour=8;s.today={revenue:0,cost:0,arrivals:0};
 s.clean=clamp(s.clean+7+s.staff.housekeeping*1.2);s.condition=clamp(s.condition+s.staff.security*.2-1);s.morale=clamp(s.morale-1.5+s.staff.manager*.7);s.suspicion=clamp(s.suspicion-1.5+(s.activeDeal?0.5:0));
 if(Math.random()<.45)maybeEvent();
 if(!s.ending)for(let i=0;i<Math.min(guestDemand(),freeRooms());i++)newGuest();
 note('Đã kết sổ ngày '+(s.day-1)+'. Lợi nhuận: '+fmt(net)+'. Công suất: '+Math.round(occ*100)+'%.');
 if(s.rep>=95&&s.cash>=10000000000&&s.suspicion<25)s.ending='Đế chế khách sạn chính thống';
 save();render();if(s.ending)toast('Chiến dịch đã kết thúc: '+s.ending);
}
function guestDemand(){return Math.max(1,Math.round(totalRooms()*(.2+s.rep/250)*(.75+s.cover/400)))}
function tick(){
 if(s.paused||s.ending)return;
 for(let i=0;i<s.speed;i++){s.hour++;if(s.hour>=24){closeDay();return}if(s.hour>=9&&s.hour<=21&&Math.random()<.18&&freeRooms()>0)newGuest();if(s.hour%4===0){s.quality=clamp(s.quality-.12);s.clean=clamp(s.clean-.25);s.condition=clamp(s.condition-.08)}}
 render();if(s.hour%2===0)save();
}
function bind(){
 document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
 $('content').onclick=e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled)doAction(b.dataset.act,b)};
 $('pause').onclick=()=>{s.paused=!s.paused;render();save()};
 $('speed').onclick=()=>{s.speed=s.speed===1?2:s.speed===2?4:1;render()};
 $('endday').onclick=()=>{if(confirm('Kết thúc ngày và chốt sổ khách sạn?'))closeDay()};
 $('import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!v.rooms||typeof v.cash!=='number')throw Error('invalid');s={...fresh(),...v};note('Đã nhập tiến trình.');save();render();toast('Khôi phục thành công.')}catch{toast('Tệp dữ liệu không hợp lệ.')}e.target.value=''};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});addEventListener('beforeunload',()=>save());
}
function updateSlots(){for(let n=1;n<=3;n++){try{const v=JSON.parse(localStorage.getItem(KEY+'-slot-'+n));$('slot-'+n).textContent=v?'Ngày '+v.day+' · '+fmt(v.cash):'Chưa có dữ liệu'}catch{$('slot-'+n).textContent='Không thể đọc dữ liệu'}}}
function init(){
 s=load();const mins=Math.min(240,Math.floor((Date.now()-s.last)/60000));
 if(mins>0&&s.guests.length){const earn=s.guests.reduce((a,g)=>a+g.rate,0)*mins/1440;s.cash+=earn;s.today.revenue+=earn;note('Tiến trình ngoại tuyến: '+mins+' phút.')}
 if(!s.log.length)note('Chào mừng đến Khách sạn Dạ Khúc. Hãy cân bằng hoạt động kinh doanh công khai và những lời đề nghị bí ẩn.');
 bind();render();timer=setInterval(tick,3000);save();
}
init();
})();