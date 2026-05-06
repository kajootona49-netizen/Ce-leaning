import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SUBJECTS = [
  { code:"819701", name:"หลักการเขียนโปรแกรม", icon:"⚙️", color:"#38bdf8", sem:"ป.1/1",
    chapters:["อัลกอริทึมและ Flowchart","ตัวแปรและ Operators","Conditions และ Loops","Functions และ Recursion"] },
  { code:"819703", name:"ระบบปฏิบัติการ", icon:"🖥️", color:"#a78bfa", sem:"ป.1/1",
    chapters:["โครงสร้าง OS และ Kernel","Process Management","Memory Management","File System และ I/O"] },
  { code:"819601", name:"คณิตศาสตร์คอมพิวเตอร์", icon:"📐", color:"#34d399", sem:"ป.1/1",
    chapters:["เซตและตรรกศาสตร์","การพิสูจน์และ Induction","Graph Theory","Combinatorics"] },
  { code:"819704", name:"ระบบฐานข้อมูล", icon:"🗄️", color:"#fbbf24", sem:"ป.1/2",
    chapters:["Relational Model และ SQL DDL","SQL DML และ Joins","Normalization","Transaction และ Index"] },
  { code:"819702", name:"การพัฒนาระบบงาน 1", icon:"🏗️", color:"#fb923c", sem:"ป.1/2",
    chapters:["SDLC และ Requirements","System Design และ UML","Agile และ Scrum","Git และ Testing"] },
  { code:"819705", name:"AI และ Machine Learning", icon:"🤖", color:"#f472b6", sem:"ป.2/1",
    chapters:["แนะนำ AI ML DL","Supervised Learning","Unsupervised Learning","Model Evaluation"] },
  { code:"819707", name:"การพัฒนาเว็บ", icon:"🌐", color:"#f97316", sem:"ป.2/1",
    chapters:["HTML5 และ Semantic Tags","CSS3 Flexbox และ Grid","JavaScript และ DOM","REST API และ Fetch"] },
  { code:"819713", name:"Mobile App Development", icon:"📱", color:"#22d3ee", sem:"ป.2/1",
    chapters:["React Native เบื้องต้น","State Props และ Hooks","Navigation","เรียก API และ Storage"] },
  { code:"819715", name:"พัฒนาเกมคอมพิวเตอร์", icon:"🎮", color:"#c084fc", sem:"ป.2/2",
    chapters:["Game Loop และ Pygame","Sprite และ Collision","Physics และ Animation","Game Design"] },
  { code:"819716", name:"ระบบฝังตัวและ IoT", icon:"📡", color:"#06b6d4", sem:"ป.2/2",
    chapters:["IoT Architecture","Sensors และ Actuators","MQTT Protocol","IoT Security"] },
  { code:"819706", name:"จริยธรรมคอมพิวเตอร์", icon:"⚖️", color:"#f87171", sem:"ป.3/1",
    chapters:["จริยธรรมดิจิทัล","พ.ร.บ.คอมพิวเตอร์","PDPA","Cybersecurity"] },
  { code:"819720", name:"การเขียนโปรแกรม IoT", icon:"🔧", color:"#4ade80", sem:"ป.3/1",
    chapters:["MicroPython และ ESP32","GPIO และ Sensors","WiFi และ HTTP","OLED Display"] },
];

const SEMS = ["ป.1/1","ป.1/2","ป.2/1","ป.2/2","ป.3/1","ป.3/2"];
const getProgress = () => { try { return JSON.parse(localStorage.getItem("cehub_prog")||"{}"); } catch { return {}; } };
const markDone = (k) => { const p = getProgress(); p[k]=true; localStorage.setItem("cehub_prog",JSON.stringify(p)); };
const getCache = () => { try { return JSON.parse(sessionStorage.getItem("cehub_cache")||"{}"); } catch { return {}; } };
const setCache = (k,v) => { const c = getCache(); c[k]=v; sessionStorage.setItem("cehub_cache",JSON.stringify(c)); };

function Skeleton({ w="100%", h=14, r=6, mb=6 }) {
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#0a1628 25%,#112240 50%,#0a1628 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",marginBottom:mb}}/>;
}

function CodeBlock({ code, lang="python" }) {
  const [cp,setCp] = useState(false);
  return (
    <div style={{background:"#050d1a",border:"1px solid #0f2040",borderRadius:11,overflow:"hidden",fontFamily:"monospace",marginTop:8}}>
      <div style={{background:"#0a1628",padding:"7px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #0f2040"}}>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {["#f87171","#fbbf24","#34d399"].map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:c,opacity:.8}}/>)}
          <span style={{color:"#334155",fontSize:10,marginLeft:4}}>{lang}</span>
        </div>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCp(true);setTimeout(()=>setCp(false),1500);}}
          style={{background:cp?"#064e3b":"#0f2040",color:cp?"#34d399":"#334155",border:"none",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10}}>
          {cp?"✓ copied":"copy"}
        </button>
      </div>
      <pre style={{margin:0,padding:"13px 15px",color:"#cdd6f4",fontSize:12.5,lineHeight:1.75,overflowX:"auto",whiteSpace:"pre"}}>{code}</pre>
    </div>
  );
}

function QuizBlock({ quiz, color }) {
  const [sel,setSel] = useState({});
  const [done,setDone] = useState({});
  const correct = Object.keys(done).filter(k=>sel[k]===quiz[+k].a).length;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{color:"#f1f5f9",fontWeight:700,fontSize:15}}>🧠 ทดสอบความเข้าใจ</div>
        {Object.keys(done).length===quiz.length&&<div style={{background:correct===quiz.length?"#064e3b":"#1e3a5f",color:correct===quiz.length?"#4ade80":"#93c5fd",border:`1px solid ${correct===quiz.length?"#16a34a":"#3b82f6"}`,borderRadius:20,padding:"4px 13px",fontWeight:800}}>{correct}/{quiz.length}</div>}
      </div>
      {quiz.map((q,qi)=>{
        const chosen=sel[qi],isDone=!!done[qi],isRight=chosen===q.a;
        return(
          <div key={qi} style={{background:"#060e1a",border:"1px solid #0d1e35",borderRadius:12,padding:"15px 17px",marginBottom:11}}>
            <p style={{color:"#e2e8f0",fontWeight:600,fontSize:14,margin:"0 0 11px",lineHeight:1.6}}><span style={{color,marginRight:6,fontWeight:800}}>Q{qi+1}.</span>{q.q}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:chosen&&!isDone?9:0}}>
              {q.choices.map((ch,ci)=>{
                let bg="#08121e",bc="#0d1e35",tc="#475569";
                if(isDone){if(ch===q.a){bg="#052e16";bc="#16a34a";tc="#4ade80";}else if(ch===chosen){bg="#2a0a0a";bc="#b91c1c";tc="#f87171";}}
                else if(chosen===ch){bg="#0f1f3d";bc=color;tc="#f1f5f9";}
                return(<button key={ci} disabled={isDone} onClick={()=>setSel(s=>({...s,[qi]:ch}))} style={{background:bg,border:`1.5px solid ${bc}`,color:tc,borderRadius:8,padding:"9px 11px",cursor:isDone?"default":"pointer",textAlign:"left",fontSize:13,lineHeight:1.4}}>{ch}</button>);
              })}
            </div>
            {!isDone&&chosen&&<button onClick={()=>setDone(d=>({...d,[qi]:true}))} style={{background:color,color:"#000",border:"none",borderRadius:7,padding:"7px 16px",cursor:"pointer",fontWeight:700,fontSize:13}}>ยืนยัน</button>}
            {isDone&&<div style={{background:isRight?"#05200f":"#1a0606",border:`1px solid ${isRight?"#166534":"#7f1d1d"}`,borderRadius:8,padding:"9px 12px",marginTop:7}}><div style={{color:isRight?"#4ade80":"#f87171",fontWeight:700,fontSize:13,marginBottom:3}}>{isRight?"✓ ถูกต้อง!":` ✗ คำตอบที่ถูก: "${q.a}"`}</div><div style={{color:"#475569",fontSize:12.5}}>💡 {q.explain}</div></div>}
          </div>
        );
      })}
    </div>
  );
}

function ChapterPage({ subject, chIdx, onBack }) {
  const {code,name,icon,color,chapters}=subject;
  const chTitle=chapters[chIdx];
  const cacheKey=`${code}_${chIdx}`;
  const [data,setData]=useState(()=>getCache()[cacheKey]||null);
  const [status,setStatus]=useState(()=>getCache()[cacheKey]?"ready":"loading");
  const [errMsg,setErrMsg]=useState("");
  const [tab,setTab]=useState("content");
  const [progress,setProgress]=useState(getProgress);
  const [readPct,setReadPct]=useState(0);
  const scrollRef=useRef(null);
  const abortRef=useRef(null);

  const load=useCallback(async()=>{
    const cached=getCache()[cacheKey];
    if(cached){setData(cached);setStatus("ready");return;}
    abortRef.current=new AbortController();
    setStatus("loading");setErrMsg("");
    try{
      const res=await fetch(`${API_URL}/api/chapter`,{method:"POST",headers:{"Content-Type":"application/json"},signal:abortRef.current.signal,body:JSON.stringify({subjectName:name,chapterTitle:chTitle})});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error||"Server error");
      setCache(cacheKey,json.data);setData(json.data);setStatus("ready");
    }catch(e){if(e.name!=="AbortError"){setErrMsg(e.message);setStatus("error");}}
  },[cacheKey,name,chTitle]);

  useEffect(()=>{load();return()=>abortRef.current?.abort();},[load]);
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const h=()=>{const t=el.scrollHeight-el.clientHeight;setReadPct(t>0?Math.min(100,el.scrollTop/t*100):0);};
    el.addEventListener("scroll",h);return()=>el.removeEventListener("scroll",h);
  },[]);

  const isDone=progress[`${code}_${chIdx}`];
  const complete=()=>{markDone(`${code}_${chIdx}`);setProgress(getProgress());};

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#020810",fontFamily:"'Sarabun',sans-serif",color:"#e2e8f0"}}>
      <div style={{height:3,background:"#0a1628",flexShrink:0}}><div style={{height:"100%",width:`${readPct}%`,background:`linear-gradient(90deg,${color},${color}88)`,transition:"width .1s"}}/></div>
      <div style={{background:"#03091a",borderBottom:"1px solid #0a1428",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",flexShrink:0}}>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid #0f1c2e",color:"#475569",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12}}>← กลับ</button>
        <div style={{display:"flex",gap:5}}>
          {[["content","📖 เนื้อหา"],["quiz","🧠 Quiz"]].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?`${color}18`:"transparent",color:tab===t?color:"#334155",border:`1px solid ${tab===t?color+"40":"#0f1c2e"}`,borderRadius:7,padding:"5px 13px",cursor:"pointer",fontSize:12,fontWeight:tab===t?700:400}}>{label}</button>
          ))}
        </div>
        {isDone?<span style={{color:"#4ade80",fontSize:12,fontWeight:700}}>✓ เรียนแล้ว</span>:<button onClick={complete} style={{background:`${color}15`,color,border:`1px solid ${color}30`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12}}>✓ เสร็จ</button>}
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto"}}>
        <div style={{maxWidth:780,margin:"0 auto",padding:"24px 14px 60px"}}>
          <div style={{marginBottom:22}}>
            <div style={{color,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:5}}>{icon} {name}</div>
            <h1 style={{color:"#f8fafc",fontWeight:800,fontSize:21,margin:"0 0 8px",lineHeight:1.3}}>{chTitle}</h1>
            <span style={{background:`${color}12`,color,border:`1px solid ${color}25`,borderRadius:20,padding:"2px 10px",fontSize:11}}>บทที่ {chIdx+1}</span>
          </div>
          {status==="loading"&&(
            <div>
              <div style={{background:`${color}08`,border:`1px solid ${color}20`,borderLeft:`4px solid ${color}30`,borderRadius:"0 12px 12px 0",padding:"16px 18px",marginBottom:20}}>
                <Skeleton w="30%" h={12} r={4} mb={8}/><Skeleton h={13} r={4} mb={5}/><Skeleton w="75%" h={13} r={4}/>
              </div>
              {[0,1,2].map(i=>(<div key={i} style={{marginBottom:24}}><Skeleton w="45%" h={15} r={5} mb={10}/><Skeleton h={13} r={4} mb={5}/><Skeleton h={13} r={4} mb={5}/><Skeleton w="65%" h={13} r={4} mb={10}/><div style={{background:"#050d1a",border:"1px solid #0f2040",borderRadius:11,padding:"12px 14px"}}>{[0,1,2,3,4].map(j=><Skeleton key={j} w={`${55+j*6}%`} h={11} r={3} mb={8}/>)}</div></div>))}
              <div style={{color:"#334155",fontSize:12,textAlign:"center",marginTop:8}}>⚙️ AI กำลังสร้างเนื้อหา "{chTitle}"...</div>
            </div>
          )}
          {status==="error"&&(
            <div style={{background:"#2a0a0a",border:"1px solid #7f1d1d",borderRadius:12,padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
              <div style={{color:"#f87171",fontWeight:700,marginBottom:4}}>เกิดข้อผิดพลาด</div>
              <div style={{color:"#64748b",fontSize:13,marginBottom:14}}>{errMsg}</div>
              <button onClick={load} style={{background:"#f87171",color:"#000",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontWeight:700}}>ลองใหม่</button>
            </div>
          )}
          {status==="ready"&&data&&tab==="content"&&(
            <div>
              <div style={{background:`${color}0d`,border:`1px solid ${color}28`,borderLeft:`4px solid ${color}`,borderRadius:"0 12px 12px 0",padding:"14px 18px",marginBottom:22}}>
                <div style={{color,fontWeight:700,fontSize:13,marginBottom:6}}>📌 บทนำ</div>
                <p style={{color:"#94a3b8",lineHeight:1.85,margin:0,fontSize:14.5}}>{data.intro}</p>
              </div>
              {data.sections?.map((sec,i)=>(
                <div key={i} style={{marginBottom:26}}>
                  <h3 style={{color:"#e2e8f0",fontSize:15,fontWeight:700,margin:"0 0 9px",display:"flex",alignItems:"center",gap:8}}><span style={{width:3,height:18,background:color,borderRadius:3,display:"block",flexShrink:0}}/>{sec.title}</h3>
                  <p style={{color:"#64748b",lineHeight:1.9,margin:"0 0 8px",fontSize:14.5}}>{sec.content}</p>
                  {sec.code&&<CodeBlock code={sec.code} lang={sec.lang||"python"}/>}
                </div>
              ))}
              {data.keypoints&&(
                <div style={{background:"#06101e",border:"1px solid #1e3a5f",borderLeft:"4px solid #3b82f6",borderRadius:"0 10px 10px 0",padding:"14px 18px",marginBottom:22}}>
                  <div style={{color:"#60a5fa",fontWeight:700,fontSize:13,marginBottom:9}}>💡 สรุปประเด็นสำคัญ</div>
                  {data.keypoints.map((kp,i)=>(<div key={i} style={{color:"#475569",fontSize:13.5,lineHeight:1.7,paddingLeft:14,position:"relative"}}><span style={{position:"absolute",left:0,color:"#3b82f6"}}>·</span>{kp}</div>))}
                </div>
              )}
              <div style={{background:"#040b16",border:`1px dashed ${color}25`,borderRadius:14,padding:"18px",textAlign:"center",marginTop:20}}>
                <div style={{fontSize:24,marginBottom:6}}>🧠</div>
                <div style={{color:"#e2e8f0",fontWeight:700,marginBottom:4}}>ทดสอบความเข้าใจ</div>
                <div style={{color:"#334155",fontSize:13,marginBottom:12}}>{data.quiz?.length||3} ข้อ</div>
                <button onClick={()=>setTab("quiz")} style={{background:color,color:"#000",border:"none",borderRadius:9,padding:"9px 24px",cursor:"pointer",fontWeight:800,fontSize:14}}>ไปทำ Quiz →</button>
              </div>
            </div>
          )}
          {status==="ready"&&data&&tab==="quiz"&&(
            <div>
              <QuizBlock quiz={data.quiz} color={color}/>
              {!isDone&&<button onClick={complete} style={{marginTop:16,width:"100%",background:`linear-gradient(135deg,${color},${color}99)`,color:"#000",border:"none",borderRadius:12,padding:"13px",cursor:"pointer",fontWeight:800,fontSize:15}}>✅ บันทึกว่าเรียนบทนี้เสร็จแล้ว</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectPage({ subject, onBack, onChapter }) {
  const progress=getProgress();
  const {color,icon,name,chapters}=subject;
  return(
    <div style={{minHeight:"100vh",background:"#020810",fontFamily:"'Sarabun',sans-serif",color:"#e2e8f0",padding:"22px 14px 60px"}}>
      <div style={{maxWidth:860,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid #0f1c2e",color:"#475569",borderRadius:8,padding:"6px 13px",cursor:"pointer",fontSize:13,marginBottom:18}}>← หน้าหลัก</button>
        <div style={{background:`linear-gradient(135deg,${color}10,#020810)`,border:`1px solid ${color}25`,borderRadius:16,padding:"20px 22px",marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:7}}>{icon}</div>
          <h1 style={{color:"#f1f5f9",fontWeight:800,fontSize:20,margin:"0 0 3px"}}>{name}</h1>
          <div style={{color:"#1e3a5f",fontSize:12}}>{chapters.length} บทเรียน</div>
        </div>
        <div style={{display:"grid",gap:7}}>
          {chapters.map((ch,idx)=>{
            const isDone=progress[`${subject.code}_${idx}`];
            return(
              <div key={idx} onClick={()=>onChapter(idx)} style={{background:"#040b16",border:`1px solid ${isDone?"#16a34a22":"#0a1428"}`,borderRadius:12,padding:"14px 17px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#07112a"} onMouseLeave={e=>e.currentTarget.style.background="#040b16"}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:34,height:34,borderRadius:9,background:isDone?"#052e16":`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",color:isDone?"#4ade80":color,fontWeight:800,fontSize:14,flexShrink:0}}>{isDone?"✓":idx+1}</div>
                  <div>
                    <div style={{color:"#e2e8f0",fontWeight:600,fontSize:13.5}}>{ch}</div>
                    <div style={{color:"#1e3a5f",fontSize:11,marginTop:3}}>บทที่ {idx+1}</div>
                  </div>
                </div>
                <span style={{color,fontSize:18}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HomePage({ onSubject }) {
  const [selSem,setSelSem]=useState("ป.1/1");
  const [progress]=useState(getProgress);
  const [countdown,setCountdown]=useState("");
  useEffect(()=>{
    const tick=()=>{
      const now=new Date(),next=new Date(now);
      if(now.getHours()>=9)next.setDate(next.getDate()+1);
      next.setHours(9,0,0,0);
      const d=next-now;
      setCountdown([Math.floor(d/3600000),Math.floor((d%3600000)/60000),Math.floor((d%60000)/1000)].map(v=>String(v).padStart(2,"0")).join(":"));
    };
    tick();const t=setInterval(tick,1000);return()=>clearInterval(t);
  },[]);
  const totalCh=SUBJECTS.reduce((s,v)=>s+v.chapters.length,0);
  const doneCh=Object.values(progress).filter(Boolean).length;
  const semSubjects=SUBJECTS.filter(s=>s.sem===selSem);
  const dateStr=new Date().toLocaleDateString("th-TH",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  return(
    <div style={{minHeight:"100vh",background:"#020810",fontFamily:"'Sarabun',sans-serif",color:"#e2e8f0"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#0f1c2e;border-radius:4px}*{box-sizing:border-box}`}</style>
      <nav style={{background:"#03091a",borderBottom:"1px solid #0a1428",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:90}}>
        <div>
          <div style={{fontWeight:800,fontSize:17,background:"linear-gradient(135deg,#38bdf8,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚡ CE Learning Hub</div>
          <div style={{color:"#1e3a5f",fontSize:10}}>{dateStr}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"#060e1a",border:"1px solid #0f1c2e",borderRadius:8,padding:"5px 11px",textAlign:"center",fontSize:11,color:"#334155"}}><div style={{color:"#f1f5f9",fontWeight:700,fontSize:13}}>{doneCh}/{totalCh}</div>บท</div>
          <div style={{background:"#060e1a",border:"1px solid #0f1c2e",borderRadius:8,padding:"5px 11px",textAlign:"center",fontSize:11,color:"#334155"}}><div style={{color:"#fbbf24",fontWeight:700,fontFamily:"monospace",fontSize:12}}>{countdown}</div>บทใหม่</div>
        </div>
      </nav>
      <div style={{maxWidth:
