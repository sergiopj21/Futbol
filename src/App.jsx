import React, { useState, useEffect } from "react";

async function apiFetch(endpoint) {
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const C = {
  bg:"#0B0F0D", bgPanel:"#111712", line:"#232B25",
  green:"#3FB855", greenDim:"#1F4A28", gold:"#C9A227",
  red:"#D9534F", text:"#EDEFEC", dim:"#8C968D", faint:"#5C665D",
};

const FLAGS = {
  MEX:"🇲🇽",KOR:"🇰🇷",CZE:"🇨🇿",RSA:"🇿🇦",CAN:"🇨🇦",SUI:"🇨🇭",BIH:"🇧🇦",QAT:"🇶🇦",
  BRA:"🇧🇷",MAR:"🇲🇦",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",HAI:"🇭🇹",USA:"🇺🇸",AUS:"🇦🇺",PAR:"🇵🇾",TUR:"🇹🇷",
  GER:"🇩🇪",CIV:"🇨🇮",ECU:"🇪🇨",CUW:"🇨🇼",NED:"🇳🇱",JPN:"🇯🇵",SWE:"🇸🇪",TUN:"🇹🇳",
  EGY:"🇪🇬",IRN:"🇮🇷",BEL:"🇧🇪",NZL:"🇳🇿",ESP:"🇪🇸",URU:"🇺🇾",CPV:"🇨🇻",KSA:"🇸🇦",
  FRA:"🇫🇷",NOR:"🇳🇴",SEN:"🇸🇳",IRQ:"🇮🇶",ARG:"🇦🇷",AUT:"🇦🇹",ALG:"🇩🇿",JOR:"🇯🇴",
  COL:"🇨🇴",POR:"🇵🇹",COD:"🇨🇩",UZB:"🇺🇿",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",GHA:"🇬🇭",CRO:"🇭🇷",PAN:"🇵🇦",
  IRN:"🇮🇷",ALG:"🇩🇿",
};

function mapStandings(data){
  return(data?.standings||[]).filter(s=>s.type==="TOTAL").map(g=>({
    groupName:g.group?.replace("Group ","Grupo ")||"",
    rows:(g.table||[]).map(r=>({
      pos:r.position,team:r.team?.name,short:r.team?.shortName||r.team?.name,
      code:r.team?.tla,pj:r.playedGames,g:r.won,e:r.draw,p:r.lost,
      gf:r.goalsFor,gc:r.goalsAgainst,pts:r.points,gd:r.goalDifference,
    }))
  }));
}
function mapFixtures(data){
  return(data?.matches||[]).map(m=>({
    id:String(m.id),home:m.homeTeam?.name||"TBD",away:m.awayTeam?.name||"TBD",
    homeCode:m.homeTeam?.tla,awayCode:m.awayTeam?.tla,
    homeShort:m.homeTeam?.shortName||m.homeTeam?.name,
    awayShort:m.awayTeam?.shortName||m.awayTeam?.name,
    scoreHome:m.score?.fullTime?.home,scoreAway:m.score?.fullTime?.away,
    phase:m.group||m.stage||"",status:m.status,date:m.utcDate,
    stage:m.stage,
  }));
}
function mapScorers(data){
  return(data?.scorers||[]).slice(0,15).map(s=>({
    name:s.player?.name,team:s.team?.tla,goals:s.goals||0,assists:s.assists||0,matches:s.playedMatches||0,
  }));
}

// ──────────────────────────────────────────────────────────────
// BRACKET OFICIAL FIFA 2026 — 16 cruces confirmados
// Fuente: CBS Sports, Sky Sports (28 jun 2026)
// Los cruces son FIJOS según el sorteo oficial de FIFA.
// Los resultados se actualizan desde la API cuando se jueguen.
// ──────────────────────────────────────────────────────────────
const OFFICIAL_R32 = [
  // LADO IZQUIERDO (de arriba a abajo)
  { id:"M74", h:{n:"Alemania",   c:"GER"}, a:{n:"Paraguay",    c:"PAR"}, date:"29 jun", stadium:"Gillette Stadium" },
  { id:"M77", h:{n:"Francia",    c:"FRA"}, a:{n:"Suecia",      c:"SWE"}, date:"30 jun", stadium:"MetLife Stadium" },
  { id:"M73", h:{n:"Sudáfrica",  c:"RSA"}, a:{n:"Canadá",      c:"CAN"}, date:"28 jun", stadium:"SoFi Stadium" },
  { id:"M75", h:{n:"P. Bajos",   c:"NED"}, a:{n:"Marruecos",   c:"MAR"}, date:"29 jun", stadium:"Estadio Monterrey" },
  { id:"M83", h:{n:"Portugal",   c:"POR"}, a:{n:"Croacia",     c:"CRO"}, date:"2 jul",  stadium:"Toronto Stadium" },
  { id:"M84", h:{n:"España",     c:"ESP"}, a:{n:"Austria",     c:"AUT"}, date:"2 jul",  stadium:"SoFi Stadium" },
  { id:"M81", h:{n:"USA",        c:"USA"}, a:{n:"Bosnia-H.",   c:"BIH"}, date:"1 jul",  stadium:"Levi's Stadium" },
  { id:"M82", h:{n:"Bélgica",    c:"BEL"}, a:{n:"Senegal",     c:"SEN"}, date:"1 jul",  stadium:"Lumen Field" },
  // LADO DERECHO (de arriba a abajo)
  { id:"M76", h:{n:"Brasil",     c:"BRA"}, a:{n:"Japón",       c:"JPN"}, date:"29 jun", stadium:"NRG Stadium" },
  { id:"M78", h:{n:"Marfil",     c:"CIV"}, a:{n:"Noruega",     c:"NOR"}, date:"30 jun", stadium:"AT&T Stadium" },
  { id:"M79", h:{n:"México",     c:"MEX"}, a:{n:"Ecuador",     c:"ECU"}, date:"30 jun", stadium:"Estadio Azteca" },
  { id:"M80", h:{n:"Inglaterra", c:"ENG"}, a:{n:"Congo DR",    c:"COD"}, date:"1 jul",  stadium:"Mercedes-Benz Stadium" },
  { id:"M86", h:{n:"Argentina",  c:"ARG"}, a:{n:"Cabo Verde",  c:"CPV"}, date:"3 jul",  stadium:"Hard Rock Stadium" },
  { id:"M88", h:{n:"Australia",  c:"AUS"}, a:{n:"Egipto",      c:"EGY"}, date:"3 jul",  stadium:"AT&T Stadium" },
  { id:"M87", h:{n:"Suiza",      c:"SUI"}, a:{n:"Argelia",     c:"ALG"}, date:"2 jul",  stadium:"Vancouver Stadium" },
  { id:"M85", h:{n:"Colombia",   c:"COL"}, a:{n:"Ghana",       c:"GHA"}, date:"3 jul",  stadium:"Arrowhead Stadium" },
];

// Octavos — ganadores de los dieciseisavos según el cuadro oficial
const OFFICIAL_R16 = [
  { id:"M89", hFrom:"W74", aFrom:"W77", date:"5 jul" },
  { id:"M90", hFrom:"W73", aFrom:"W75", date:"5 jul" },
  { id:"M91", hFrom:"W83", aFrom:"W84", date:"6 jul" },
  { id:"M92", hFrom:"W81", aFrom:"W82", date:"7 jul" },
  { id:"M93", hFrom:"W76", aFrom:"W78", date:"5 jul" },
  { id:"M94", hFrom:"W79", aFrom:"W80", date:"6 jul" },
  { id:"M95", hFrom:"W86", aFrom:"W88", date:"7 jul" },
  { id:"M96", hFrom:"W85", aFrom:"W87", date:"8 jul" },
];
const OFFICIAL_QF = [
  { id:"M97",  hFrom:"W89", aFrom:"W90", date:"9 jul" },
  { id:"M98",  hFrom:"W91", aFrom:"W92", date:"10 jul" },
  { id:"M99",  hFrom:"W93", aFrom:"W94", date:"11 jul" },
  { id:"M100", hFrom:"W95", aFrom:"W96", date:"12 jul" },
];
const OFFICIAL_SF = [
  { id:"M101", hFrom:"W97",  aFrom:"W98",  date:"14 jul" },
  { id:"M102", hFrom:"W99",  aFrom:"W100", date:"15 jul" },
];
const OFFICIAL_FIN   = { id:"M104", hFrom:"W101", aFrom:"W102", date:"19 jul · MetLife NJ" };
const OFFICIAL_THIRD = { id:"M103", hFrom:"RU101", aFrom:"RU102", date:"18 jul" };

// Enriquece los cruces de dieciseisavos con resultados reales si ya se han jugado
function enrichWithResults(r32, knockoutMatches) {
  return r32.map(match => {
    // Buscamos el partido en los resultados de la API por los nombres de los equipos
    const found = knockoutMatches.find(m => {
      const hMatch = m.home?.toLowerCase().includes(match.h.n.toLowerCase()) ||
                     match.h.n.toLowerCase().includes(m.homeShort?.toLowerCase()||"");
      const aMatch = m.away?.toLowerCase().includes(match.a.n.toLowerCase()) ||
                     match.a.n.toLowerCase().includes(m.awayShort?.toLowerCase()||"");
      return (hMatch && aMatch) || m.phase === "LAST_32";
    });
    if (!found) return { ...match, status:"NS" };
    return {
      ...match,
      scoreH: found.scoreHome,
      scoreA: found.scoreAway,
      status: found.status,
    };
  });
}

// ── COMPONENTES ──

function ST({ children, style={} }) {
  return <div style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:C.dim, margin:"18px 16px 10px", ...style }}>{children}</div>;
}

function MatchRow({ m }) {
  const dt = new Date(m.date);
  const done = m.status==="FINISHED";
  const live = ["IN_PROGRESS","PAUSED","LIVE"].includes(m.status);
  const ds = dt.toLocaleDateString("es-ES",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  return (
    <div style={{ padding:"10px 0", borderTop:`1px solid ${C.line}` }}>
      <p style={{ fontSize:10, color:live?C.red:C.faint, marginBottom:4, fontWeight:live?700:400 }}>
        {(m.phase?.replace("GROUP_STAGE","Fase de grupos")||"")} · {live?"🔴 EN DIRECTO":done?"Finalizado":ds}
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:16 }}>{FLAGS[m.homeCode]||"🏳️"}</span>
        <span style={{ flex:1, fontSize:13, fontWeight:done&&m.scoreHome>m.scoreAway?700:400 }}>{m.homeShort||m.home}</span>
        <span style={{ fontSize:done||live?18:13, fontWeight:800, color:live?C.green:C.text, margin:"0 8px", minWidth:44, textAlign:"center" }}>
          {done||live?`${m.scoreHome??"-"} – ${m.scoreAway??"-"}`:"–"}
        </span>
        <span style={{ flex:1, textAlign:"right", fontSize:13, fontWeight:done&&m.scoreAway>m.scoreHome?700:400 }}>{m.awayShort||m.away}</span>
        <span style={{ fontSize:16 }}>{FLAGS[m.awayCode]||"🏳️"}</span>
      </div>
    </div>
  );
}

// ── Tarjeta dieciseisavos ──
function BkReal({ m }) {
  const live = ["IN_PROGRESS","PAUSED","LIVE"].includes(m.status);
  const done = m.status==="FINISHED";
  const hWin = done && m.scoreH > m.scoreA;
  const aWin = done && m.scoreA > m.scoreH;
  return (
    <div style={{
      width:145, background:"#141B15",
      border:`1px solid ${live?C.green:done?"#1A3020":"#1E2820"}`,
      borderRadius:7, overflow:"hidden", flexShrink:0,
      boxShadow:live?`0 0 8px rgba(63,184,85,.2)`:"none"
    }}>
      <div style={{ fontSize:9, padding:"2px 6px", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", textAlign:"center", background:"#0A1A0C", color:live?C.green:C.faint }}>
        {live?"🔴 EN DIRECTO":`${m.id} · ${m.date}`}
      </div>
      {[{t:m.h,score:m.scoreH,win:hWin},{t:m.a,score:m.scoreA,win:aWin}].map(({t,score,win},i)=>(
        <React.Fragment key={i}>
          {i===1 && <div style={{ height:1, background:"#192219" }} />}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 8px", minHeight:33, background:win?"rgba(63,184,85,.1)":"transparent" }}>
            <span style={{ fontSize:15, width:20, textAlign:"center" }}>{FLAGS[t.c]||"🏳️"}</span>
            <span style={{ flex:1, fontSize:11, fontWeight:win?700:400, color:win?C.text:done&&!win?C.faint:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {t.n}
            </span>
            {(done||live) && <span style={{ fontSize:13, fontWeight:800, color:win?C.green:C.faint }}>{score??""}</span>}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Tarjeta ronda futura ──
function BkFuture({ hFrom, aFrom, label, date, isFinal, isThird }) {
  return (
    <div style={{
      width:isFinal?150:138,
      background:isFinal?"#1A1508":isThird?"#111008":"#0D1410",
      border:`1px solid ${isFinal?C.gold:isThird?"#3A3010":"#131A14"}`,
      borderRadius:7, overflow:"hidden", flexShrink:0, opacity:.6,
      boxShadow:isFinal?`0 0 14px rgba(201,162,39,.15)`:"none"
    }}>
      <div style={{ fontSize:9, padding:"2px 6px", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", textAlign:"center", color:isFinal?C.gold:isThird?"#7A7020":C.faint }}>
        {isFinal?"⚽ FINAL":isThird?"3er puesto":label} · {date}
      </div>
      {[hFrom,aFrom].map((from,i)=>(
        <React.Fragment key={i}>
          {i===1 && <div style={{ height:1, background:"#192219" }} />}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 8px", minHeight:33 }}>
            <span style={{ fontSize:13, width:20, textAlign:"center", color:C.faint }}>·</span>
            <span style={{ flex:1, fontSize:11, color:C.faint, fontStyle:"italic" }}>{from}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── SVG conectores ──
const CH=67, GAP=8;
function tH(n){ return n*(CH+GAP)-GAP; }

function ConnL({ n }) {
  const h=tH(n), pairs=n/2;
  const paths=[];
  for(let i=0;i<pairs;i++){
    const y1=(i*2)*(CH+GAP)+CH/2, y2=(i*2+1)*(CH+GAP)+CH/2, ym=(y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M0,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M0,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H24`}        stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={h} style={{ flexShrink:0, alignSelf:"flex-start", marginTop:22 }}>{paths}</svg>;
}
function ConnR({ n }) {
  const h=tH(n), pairs=n/2;
  const paths=[];
  for(let i=0;i<pairs;i++){
    const y1=(i*2)*(CH+GAP)+CH/2, y2=(i*2+1)*(CH+GAP)+CH/2, ym=(y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M24,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M24,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H0`}          stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={h} style={{ flexShrink:0, alignSelf:"flex-start", marginTop:22 }}>{paths}</svg>;
}
function ConnMidL({ fromN, toN }) {
  const h=tH(fromN), srcH=h/fromN, paths=[];
  for(let i=0;i<toN;i++){
    const y1=(i*2)*srcH+srcH/2, y2=(i*2+1)*srcH+srcH/2, ym=(y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M0,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M0,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H24`}        stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={h} style={{ flexShrink:0, alignSelf:"flex-start", marginTop:22 }}>{paths}</svg>;
}
function ConnMidR({ fromN, toN }) {
  const h=tH(fromN), srcH=h/fromN, paths=[];
  for(let i=0;i<toN;i++){
    const y1=(i*2)*srcH+srcH/2, y2=(i*2+1)*srcH+srcH/2, ym=(y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M24,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M24,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H0`}          stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={h} style={{ flexShrink:0, alignSelf:"flex-start", marginTop:22 }}>{paths}</svg>;
}
function LineH({ h }) {
  return <svg width={24} height={h} style={{ flexShrink:0, marginTop:22 }}><path d={`M0,${h/2} H24`} stroke="#1A3020" strokeWidth={1} fill="none"/></svg>;
}

function ColHdr({ children, sub, gold=false }) {
  return (
    <div style={{ textAlign:"center", paddingBottom:8 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase", color:gold?C.gold:C.faint, whiteSpace:"nowrap" }}>{children}</div>
      {sub && <div style={{ fontSize:9, color:"#2A3A2C", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function FutureCol({ matches, n }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-around", height:tH(n), flexShrink:0 }}>
      {matches.map(m=><BkFuture key={m.id} hFrom={m.hFrom} aFrom={m.aFrom} label={m.id} date={m.date}/>)}
    </div>
  );
}

// ── PANTALLA BRACKET ──
function ScreenBracket({ enrichedR32 }) {
  const LEFT  = enrichedR32.slice(0, 8);
  const RIGHT = enrichedR32.slice(8, 16);
  const T8 = tH(8);

  return (
    <div>
      <div style={{ margin:"12px 16px 4px", padding:"10px 14px", background:"rgba(63,184,85,.06)", borderRadius:10, border:`1px solid #1A3020` }}>
        <p style={{ fontSize:12, color:C.green, fontWeight:700, marginBottom:2 }}>🏆 Cuadro oficial FIFA World Cup 2026</p>
        <p style={{ fontSize:11, color:C.dim, lineHeight:1.5 }}>
          32 equipos clasificados: 12 ganadores de grupo + 12 segundos + 8 mejores terceros.
          Resultados en directo cuando se jueguen. Scroll horizontal ↔
        </p>
      </div>

      <div style={{ overflowX:"auto", padding:"12px 12px 24px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:0, minWidth:"max-content" }}>

          {/* DIECISEISAVOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColHdr sub="28 jun – 3 jul">16vos</ColHdr>
            <div style={{ display:"flex", flexDirection:"column", gap:GAP }}>
              {LEFT.map(m=><BkReal key={m.id} m={m}/>)}
            </div>
          </div>

          <ConnL n={8}/>

          {/* OCTAVOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColHdr sub="5–7 jul">8vos</ColHdr>
            <FutureCol matches={OFFICIAL_R16.slice(0,4)} n={4}/>
          </div>

          <ConnMidL fromN={4} toN={2}/>

          {/* CUARTOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColHdr sub="9–10 jul">4tos</ColHdr>
            <FutureCol matches={OFFICIAL_QF.slice(0,2)} n={2}/>
          </div>

          <ConnMidL fromN={2} toN={1}/>

          {/* SEMIS IZQUIERDO */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", height:T8, flexShrink:0 }}>
            <ColHdr sub="14 jul">Semis</ColHdr>
            <BkFuture hFrom={OFFICIAL_SF[0].hFrom} aFrom={OFFICIAL_SF[0].aFrom} label={OFFICIAL_SF[0].id} date={OFFICIAL_SF[0].date}/>
          </div>

          <LineH h={T8}/>

          {/* FINAL + 3er PUESTO */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:T8, flexShrink:0, gap:8, padding:"0 6px" }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, textAlign:"center" }}>⚽ FINAL</div>
            <BkFuture hFrom={OFFICIAL_FIN.hFrom} aFrom={OFFICIAL_FIN.aFrom} label={OFFICIAL_FIN.id} date={OFFICIAL_FIN.date} isFinal/>
            <div style={{ height:1, width:"100%", background:C.line, margin:"4px 0" }}/>
            <div style={{ fontSize:9, color:C.faint, textAlign:"center" }}>3er puesto · 18 jul</div>
            <BkFuture hFrom={OFFICIAL_THIRD.hFrom} aFrom={OFFICIAL_THIRD.aFrom} label={OFFICIAL_THIRD.id} date={OFFICIAL_THIRD.date} isThird/>
          </div>

          <LineH h={T8}/>

          {/* SEMIS DERECHO */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", height:T8, flexShrink:0 }}>
            <BkFuture hFrom={OFFICIAL_SF[1].hFrom} aFrom={OFFICIAL_SF[1].aFrom} label={OFFICIAL_SF[1].id} date={OFFICIAL_SF[1].date}/>
          </div>

          <ConnMidR fromN={2} toN={1}/>

          {/* CUARTOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <FutureCol matches={OFFICIAL_QF.slice(2,4)} n={2}/>
          </div>

          <ConnMidR fromN={4} toN={2}/>

          {/* OCTAVOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <FutureCol matches={OFFICIAL_R16.slice(4,8)} n={4}/>
          </div>

          <ConnR n={8}/>

          {/* DIECISEISAVOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <ColHdr sub="28 jun – 3 jul">16vos</ColHdr>
            <div style={{ display:"flex", flexDirection:"column", gap:GAP }}>
              {RIGHT.map(m=><BkReal key={m.id} m={m}/>)}
            </div>
          </div>

        </div>
      </div>
      <p style={{ fontSize:10, color:C.faint, textAlign:"center", padding:"0 16px 16px", lineHeight:1.5 }}>
        Los resultados aparecen automáticamente conforme se juegan los partidos · Actualización cada 30s
      </p>
    </div>
  );
}

// ── PANTALLA INICIO ──
function ScreenHome({ data }) {
  const { liveMatches, upcoming, finished, scorers } = data;
  const Cd = (ch,st={}) => <div style={{ background:"#161D18", border:`1px solid ${C.line}`, borderRadius:12, padding:14, ...st }}>{ch}</div>;
  return (
    <div>
      <ST>En directo</ST>
      <div style={{ padding:"0 16px" }}>
        {liveMatches.length>0
          ? Cd(<>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:C.red,display:"inline-block",animation:"pulse 1.4s infinite" }}/>
                <span style={{ fontSize:11,fontWeight:700,color:C.red }}>EN DIRECTO</span>
              </div>
              {liveMatches.map(m=><MatchRow key={m.id} m={m}/>)}
            </>, {borderColor:"#1F4A28"})
          : Cd(<p style={{ color:C.dim,fontSize:14 }}>No hay partidos en directo ahora mismo.</p>)
        }
      </div>
      {finished.length>0&&<><ST>Resultados recientes</ST><div style={{ padding:"0 16px" }}>{Cd(finished.slice(-6).reverse().map(m=><MatchRow key={m.id} m={m}/>))}</div></>}
      {upcoming.length>0&&<><ST>Próximos partidos</ST><div style={{ padding:"0 16px" }}>{Cd(upcoming.slice(0,6).map(m=><MatchRow key={m.id} m={m}/>))}</div></>}
      {scorers.length>0&&<>
        <ST>Goleadores</ST>
        <div style={{ padding:"0 16px" }}>
          {Cd(scorers.slice(0,8).map((p,i)=>(
            <div key={p.name+i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderTop:i?`1px solid ${C.line}`:"none" }}>
              <span style={{ fontSize:12,color:i===0?C.gold:C.faint,width:20,fontWeight:700 }}>{i===0?"🥇":i+1}</span>
              <span style={{ fontSize:17 }}>{FLAGS[p.team]||"🏳️"}</span>
              <span style={{ flex:1,fontSize:13 }}>{p.name||""}</span>
              <div style={{ width:Math.max(4,p.goals*14),height:3,background:i===0?C.gold:C.green,borderRadius:2,marginRight:8 }}/>
              <span style={{ fontWeight:800,fontSize:15,color:i===0?C.gold:C.text }}>{p.goals}</span>
              <span style={{ fontSize:11,color:C.faint,marginLeft:3 }}>goles</span>
            </div>
          )))}
        </div>
      </>}
    </div>
  );
}

// ── PANTALLA GRUPOS ──
function ScreenGroups({ data }) {
  const { standings, finished } = data;
  const [sel, setSel] = useState(standings[0]?.groupName||"");
  const group = standings.find(g=>g.groupName===sel)||standings[0];
  const letter = (sel||"").replace("Grupo ","");
  const gMatches = finished.filter(m=>{
    const ph = m.phase||"";
    return ph.includes("Group "+letter)||ph===sel||ph.includes(letter);
  });
  return (
    <div>
      <div style={{ display:"flex",gap:5,padding:"10px 14px",overflowX:"auto" }}>
        {standings.map(g=>(
          <button key={g.groupName} onClick={()=>setSel(g.groupName)} style={{
            flexShrink:0,padding:"5px 11px",borderRadius:7,
            border:`1px solid ${sel===g.groupName?C.green:C.line}`,
            background:sel===g.groupName?"rgba(63,184,85,.12)":"transparent",
            color:sel===g.groupName?C.green:C.dim,fontSize:12,fontWeight:700,cursor:"pointer"
          }}>{g.groupName.replace("Grupo ","")}</button>
        ))}
      </div>
      {group&&(
        <div style={{ padding:"0 16px" }}>
          <div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"20px 1fr 26px 26px 26px 28px 32px",padding:"7px 12px",fontSize:10,color:C.faint,fontWeight:700,textTransform:"uppercase",gap:2,borderBottom:`1px solid ${C.line}` }}>
              <span>#</span><span>Equipo</span><span style={{textAlign:"center"}}>PJ</span><span style={{textAlign:"center"}}>G</span><span style={{textAlign:"center"}}>E</span><span style={{textAlign:"center"}}>DG</span><span style={{textAlign:"center"}}>Pts</span>
            </div>
            {(group.rows||[]).map((t,i)=>(
              <div key={t.team} style={{ display:"grid",gridTemplateColumns:"20px 1fr 26px 26px 26px 28px 32px",alignItems:"center",padding:"9px 12px",gap:2,borderTop:i?`1px solid ${C.line}`:"none",background:t.pos<=2?"rgba(63,184,85,.05)":t.pos===3?"rgba(200,180,0,.03)":"transparent" }}>
                <span style={{ fontSize:11,color:t.pos<=2?C.green:t.pos===3?"#9A8820":C.faint,fontWeight:700 }}>{t.pos}</span>
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ fontSize:14 }}>{FLAGS[t.code]||"🏳️"}</span>
                  <span style={{ fontSize:12,fontWeight:t.pos<=2?600:400 }}>{t.short||t.team}</span>
                </div>
                <span style={{ fontSize:11,textAlign:"center",color:C.dim }}>{t.pj}</span>
                <span style={{ fontSize:11,textAlign:"center",color:C.dim }}>{t.g}</span>
                <span style={{ fontSize:11,textAlign:"center",color:C.dim }}>{t.e}</span>
                <span style={{ fontSize:11,textAlign:"center",color:t.gd>0?C.green:t.gd<0?C.red:C.dim }}>{t.gd>0?"+"+t.gd:t.gd}</span>
                <span style={{ fontSize:13,fontWeight:700,textAlign:"center" }}>{t.pts}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:11,color:C.faint,marginTop:6 }}>🟢 Clasifican directamente · 🟡 Posible mejor 3º</p>
        </div>
      )}
      {gMatches.length>0&&<>
        <ST>Partidos — {sel}</ST>
        <div style={{ padding:"0 16px" }}><div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,padding:14 }}>{gMatches.map(m=><MatchRow key={m.id} m={m}/>)}</div></div>
      </>}
    </div>
  );
}

// ── PANTALLA JUGADORES ──
function ScreenPlayers({ data }) {
  const { scorers } = data;
  const assists = [...scorers].filter(s=>s.assists>0).sort((a,b)=>b.assists-a.assists);
  const maxG = Math.max(...scorers.map(s=>s.goals),1);
  const Cd = ch => <div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,padding:14 }}>{ch}</div>;
  return (
    <div style={{ padding:16 }}>
      <ST style={{ margin:"0 0 12px" }}>Goleadores · {scorers.length} jugadores</ST>
      {Cd(scorers.map((p,i)=>(
        <div key={p.name+i} style={{ padding:"10px 0",borderTop:i?`1px solid ${C.line}`:"none" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
            <span style={{ fontSize:12,color:i===0?C.gold:C.faint,width:22,fontWeight:700 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
            <span style={{ fontSize:17 }}>{FLAGS[p.team]||"🏳️"}</span>
            <span style={{ flex:1,fontSize:13,fontWeight:i<3?600:400 }}>{p.name||""}</span>
            <span style={{ fontWeight:800,fontSize:15,color:i===0?C.gold:C.text }}>{p.goals}</span>
            <span style={{ fontSize:11,color:C.faint,marginLeft:3 }}>G · {p.matches}PJ</span>
          </div>
          <div style={{ height:3,background:C.line,borderRadius:2,marginLeft:30 }}>
            <div style={{ height:"100%",width:`${(p.goals/maxG)*100}%`,background:i===0?C.gold:C.green,borderRadius:2 }}/>
          </div>
        </div>
      )))}
      {assists.length>0&&<>
        <ST>Asistencias</ST>
        {Cd(assists.slice(0,10).map((p,i)=>(
          <div key={p.name+i} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 0",borderTop:i?`1px solid ${C.line}`:"none" }}>
            <span style={{ fontSize:12,color:C.faint,width:22,fontWeight:700 }}>{i+1}</span>
            <span style={{ fontSize:17 }}>{FLAGS[p.team]||"🏳️"}</span>
            <span style={{ flex:1,fontSize:13 }}>{p.name||""}</span>
            <span style={{ fontWeight:800,fontSize:15 }}>{p.assists}</span>
            <span style={{ fontSize:11,color:C.faint,marginLeft:3 }}>asist.</span>
          </div>
        )))}
      </>}
    </div>
  );
}

// ── APP PRINCIPAL ──
const TABS = [
  { id:"home",    label:"Inicio",    icon:"🏠" },
  { id:"groups",  label:"Grupos",    icon:"📊" },
  { id:"bracket", label:"Bracket",   icon:"🏆" },
  { id:"players", label:"Jugadores", icon:"⚽" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appData, setAppData] = useState({ standings:[], liveMatches:[], upcoming:[], finished:[], scorers:[], knockoutMatches:[] });
  const [lastUpdate, setLastUpdate] = useState(null);

  async function loadData() {
    try {
      const [sRes, fRes, scRes] = await Promise.all([
        apiFetch("/api/standings"),
        apiFetch("/api/fixtures"),
        apiFetch("/api/scorers"),
      ]);
      const standings = mapStandings(sRes);
      const all = mapFixtures(fRes);
      const knockoutMatches = all.filter(m=>m.stage==="LAST_32"||m.stage==="ROUND_OF_32");
      setAppData({
        standings,
        liveMatches: all.filter(m=>["IN_PROGRESS","PAUSED","LIVE"].includes(m.status)),
        upcoming:    all.filter(m=>["SCHEDULED","TIMED"].includes(m.status)),
        finished:    all.filter(m=>m.status==="FINISHED"),
        scorers:     mapScorers(scRes),
        knockoutMatches,
      });
      setLastUpdate(new Date());
      setError(null);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ loadData(); const iv=setInterval(loadData,30000); return()=>clearInterval(iv); },[]);

  const enrichedR32 = enrichWithResults(OFFICIAL_R32, appData.knockoutMatches);

  return (
    <div style={{ background:C.bg, minHeight:"100vh", paddingBottom:68, color:C.text, fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0F1410}
        ::-webkit-scrollbar-thumb{background:#1F2E21;border-radius:2px}
      `}</style>

      <div style={{ position:"sticky",top:0,zIndex:10,background:C.bg,borderBottom:`1px solid ${C.line}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:20 }}>⚽</span>
          <span style={{ fontWeight:800,fontSize:18,letterSpacing:"-.02em" }}>MATCHDAY</span>
          <span style={{ fontSize:10,color:C.green,marginLeft:6,fontWeight:700,padding:"2px 7px",background:"rgba(63,184,85,.1)",borderRadius:5 }}>Mundial 2026</span>
        </div>
        {lastUpdate&&(
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block" }}/>
            <span style={{ fontSize:10,color:C.faint }}>{lastUpdate.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        )}
      </div>

      {error&&(
        <div style={{ margin:"10px 14px",padding:"10px 13px",background:"rgba(217,83,79,.1)",border:`1px solid ${C.red}`,borderRadius:10 }}>
          <p style={{ fontSize:12,color:C.red,fontWeight:700,marginBottom:3 }}>⚠️ Error</p>
          <p style={{ fontSize:12,color:C.dim,lineHeight:1.5 }}>{error}</p>
        </div>
      )}

      {loading
        ? <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"50vh",gap:14 }}>
            <div style={{ width:30,height:30,border:`3px solid #1F4A28`,borderTopColor:C.green,borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
            <p style={{ color:C.dim,fontSize:14 }}>Cargando datos del Mundial...</p>
          </div>
        : <div style={{ maxWidth:screen==="bracket"?undefined:560,margin:"0 auto" }}>
            {screen==="home"    && <ScreenHome data={appData}/>}
            {screen==="groups"  && <ScreenGroups data={appData}/>}
            {screen==="bracket" && <ScreenBracket enrichedR32={enrichedR32}/>}
            {screen==="players" && <ScreenPlayers data={appData}/>}
          </div>
      }

      <div style={{ position:"fixed",bottom:0,left:0,right:0,background:C.bgPanel,borderTop:`1px solid ${C.line}`,zIndex:10 }}>
        <div style={{ display:"flex",maxWidth:560,margin:"0 auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setScreen(t.id)}
              style={{ flex:1,background:"none",border:"none",padding:"10px 0 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",color:screen===t.id?C.green:C.faint }}>
              <span style={{ fontSize:21 }}>{t.icon}</span>
              <span style={{ fontSize:10,fontWeight:screen===t.id?700:500 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

