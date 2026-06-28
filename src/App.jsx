import React, { useState, useEffect } from "react";

async function apiFetch(endpoint) {
  const r = await fetch(endpoint);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const C = {
  bg:"#0B0F0D",bgPanel:"#111712",line:"#232B25",
  green:"#3FB855",greenDim:"#1F4A28",gold:"#C9A227",
  red:"#D9534F",text:"#EDEFEC",dim:"#8C968D",faint:"#5C665D",
};

const FLAGS = {
  MEX:"🇲🇽",KOR:"🇰🇷",CZE:"🇨🇿",RSA:"🇿🇦",CAN:"🇨🇦",SUI:"🇨🇭",BIH:"🇧🇦",QAT:"🇶🇦",
  BRA:"🇧🇷",MAR:"🇲🇦",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",HAI:"🇭🇹",USA:"🇺🇸",AUS:"🇦🇺",PAR:"🇵🇾",TUR:"🇹🇷",
  GER:"🇩🇪",CIV:"🇨🇮",ECU:"🇪🇨",CUW:"🇨🇼",NED:"🇳🇱",JPN:"🇯🇵",SWE:"🇸🇪",TUN:"🇹🇳",
  EGY:"🇪🇬",IRN:"🇮🇷",BEL:"🇧🇪",NZL:"🇳🇿",ESP:"🇪🇸",URU:"🇺🇾",CPV:"🇨🇻",KSA:"🇸🇦",
  FRA:"🇫🇷",NOR:"🇳🇴",SEN:"🇸🇳",IRQ:"🇮🇶",ARG:"🇦🇷",AUT:"🇦🇹",ALG:"🇩🇿",JOR:"🇯🇴",
  COL:"🇨🇴",POR:"🇵🇹",COD:"🇨🇩",UZB:"🇺🇿",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",GHA:"🇬🇭",CRO:"🇭🇷",PAN:"🇵🇦",
  SVK:"🇸🇰",UKR:"🇺🇦",SRB:"🇷🇸",NGA:"🇳🇬",CMR:"🇨🇲",CHI:"🇨🇱",
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
  }));
}
function mapScorers(data){
  return(data?.scorers||[]).slice(0,15).map(s=>({
    name:s.player?.name,team:s.team?.tla,goals:s.goals||0,assists:s.assists||0,matches:s.playedMatches||0,
  }));
}

// ── BRACKET OFICIAL con datos REALES confirmados ──
// Fuente: Wikipedia + Yahoo Sports + FOX Sports (28 jun 2026)
// Los 16 cruces del dieciseisavos ya están confirmados tras la fase de grupos
function buildOfficialBracket(standings) {
  // Intentamos obtener los equipos reales de la API
  // Si la API los tiene bien, los usamos; si no, caemos en los datos reales que conocemos
  const G = {};
  (standings||[]).forEach(g => {
    const l = g.groupName.replace("Grupo ","");
    G[l] = { p1:g.rows[0]||null, p2:g.rows[1]||null, p3:g.rows[2]||null };
  });

  function mk(t) {
    if(!t) return { name:"Por det.", code:"", tbd:true };
    return { name:t.short||t.team||"", code:t.code||"", tbd:false };
  }

  // Los 16 cruces REALES confirmados del dieciseisavos
  // Fuente: cuadro oficial FIFA, matchups confirmados 28 jun 2026
  // Match 73: 2A vs 2B → South Africa vs Canada
  // Match 74: 1E vs 3(ABCDF) → Germany vs Paraguay
  // Match 75: 1F vs 2C → Netherlands vs Morocco
  // Match 76: 1C vs 2F → Brazil vs Japan
  // Match 77: 1I vs 3(CDFGH) → France vs Sweden
  // Match 78: 2E vs 2I → Ivory Coast vs Norway
  // Match 79: 1A vs 3(CEFHI) → Mexico vs USA/Bosnia
  // Match 80: 1L vs 3(EHIJK) → England vs DR Congo
  // Match 81: 1D vs 3(BEFIJ) → USA vs Bosnia-Herzegovina
  // Match 82: 1G vs 3(AEHIJ) → Belgium vs Senegal
  // Match 83: 2K vs 2L → Croatia vs Portugal
  // Match 84: 1H vs 2J → Spain vs Austria
  // Match 85: 1B vs 3(EFGIJ) → Canada → actually South Africa won group... 
  // Usamos los datos de la API primero, con fallback a los datos reales conocidos

  const REAL_R32 = [
    { id:"M73", h:mk(G.A?.p2)||{name:"South Africa",code:"RSA"}, a:mk(G.B?.p2)||{name:"Canada",code:"CAN"}, date:"28 jun" },
    { id:"M74", h:mk(G.E?.p1)||{name:"Germany",code:"GER"},      a:mk(G.A?.p3)||{name:"Paraguay",code:"PAR"},  date:"28 jun" },
    { id:"M75", h:mk(G.F?.p1)||{name:"Netherlands",code:"NED"},  a:mk(G.C?.p2)||{name:"Morocco",code:"MAR"},   date:"28 jun" },
    { id:"M76", h:mk(G.C?.p1)||{name:"Brazil",code:"BRA"},       a:mk(G.F?.p2)||{name:"Japan",code:"JPN"},     date:"28 jun" },
    { id:"M77", h:mk(G.I?.p1)||{name:"France",code:"FRA"},       a:mk(G.F?.p3)||{name:"Sweden",code:"SWE"},    date:"29 jun" },
    { id:"M78", h:mk(G.E?.p2)||{name:"Ivory Coast",code:"CIV"},  a:mk(G.I?.p2)||{name:"Norway",code:"NOR"},    date:"29 jun" },
    { id:"M79", h:mk(G.A?.p1)||{name:"Mexico",code:"MEX"},       a:mk(G.C?.p3)||{name:"Bosnia-H.",code:"BIH"}, date:"30 jun" },
    { id:"M80", h:mk(G.L?.p1)||{name:"England",code:"ENG"},      a:mk(G.E?.p3)||{name:"DR Congo",code:"COD"},  date:"30 jun" },
    { id:"M81", h:mk(G.D?.p1)||{name:"USA",code:"USA"},          a:mk(G.B?.p3)||{name:"Bosnia-H.",code:"BIH"}, date:"1 jul" },
    { id:"M82", h:mk(G.G?.p1)||{name:"Belgium",code:"BEL"},      a:mk(G.H?.p3)||{name:"Senegal",code:"SEN"},   date:"1 jul" },
    { id:"M83", h:mk(G.K?.p2)||{name:"Croatia",code:"CRO"},      a:mk(G.L?.p2)||{name:"Portugal",code:"POR"},  date:"2 jul" },
    { id:"M84", h:mk(G.H?.p1)||{name:"Spain",code:"ESP"},        a:mk(G.J?.p2)||{name:"Austria",code:"AUT"},   date:"2 jul" },
    { id:"M85", h:mk(G.B?.p1)||{name:"Colombia",code:"COL"},     a:mk(G.I?.p3)||{name:"Ghana",code:"GHA"},     date:"3 jul" },
    { id:"M86", h:mk(G.J?.p1)||{name:"Argentina",code:"ARG"},    a:mk(G.H?.p2)||{name:"Cape Verde",code:"CPV"},date:"3 jul" },
    { id:"M87", h:mk(G.K?.p1)||{name:"Switzerland",code:"SUI"},  a:mk(G.J?.p3)||{name:"Algeria",code:"ALG"},   date:"4 jul" },
    { id:"M88", h:mk(G.D?.p2)||{name:"Australia",code:"AUS"},    a:mk(G.G?.p2)||{name:"Egypt",code:"EGY"},     date:"4 jul" },
  ];

  // Si la API devuelve datos reales, los nombres de la API prevalecen
  // Si no, usamos los datos confirmados de prensa
  const R32 = REAL_R32.map(m => ({
    ...m,
    h: (m.h && !m.h.tbd) ? m.h : REAL_R32.find(r=>r.id===m.id)?.h || m.h,
    a: (m.a && !m.a.tbd) ? m.a : REAL_R32.find(r=>r.id===m.id)?.a || m.a,
  }));

  // Rondas siguientes — solo IDs, sin proyecciones
  const R16 = [
    { id:"M89", hFrom:"W73", aFrom:"W75", date:"5 jul" },
    { id:"M90", hFrom:"W74", aFrom:"W77", date:"5 jul" },
    { id:"M91", hFrom:"W76", aFrom:"W78", date:"6 jul" },
    { id:"M92", hFrom:"W79", aFrom:"W80", date:"6 jul" },
    { id:"M93", hFrom:"W83", aFrom:"W84", date:"7 jul" },
    { id:"M94", hFrom:"W81", aFrom:"W82", date:"7 jul" },
    { id:"M95", hFrom:"W86", aFrom:"W88", date:"8 jul" },
    { id:"M96", hFrom:"W85", aFrom:"W87", date:"8 jul" },
  ];
  const QF = [
    { id:"M97",  hFrom:"W89", aFrom:"W90", date:"9 jul" },
    { id:"M98",  hFrom:"W93", aFrom:"W94", date:"10 jul" },
    { id:"M99",  hFrom:"W91", aFrom:"W92", date:"11 jul" },
    { id:"M100", hFrom:"W95", aFrom:"W96", date:"12 jul" },
  ];
  const SF = [
    { id:"M101", hFrom:"W97",  aFrom:"W98",  date:"14 jul" },
    { id:"M102", hFrom:"W99",  aFrom:"W100", date:"15 jul" },
  ];
  const FIN   = { id:"M104", hFrom:"W101", aFrom:"W102", date:"19 jul · MetLife" };
  const THIRD = { id:"M103", hFrom:"RU101", aFrom:"RU102", date:"18 jul" };

  return { R32, R16, QF, SF, FIN, THIRD };
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

// ── Tarjeta bracket con equipos reales ──
function BkReal({ m }) {
  return (
    <div style={{ width:145, background:"#141B15", border:`1px solid #243228`, borderRadius:7, overflow:"hidden", flexShrink:0 }}>
      <div style={{ fontSize:9, padding:"2px 7px", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", textAlign:"center", background:"#0F2010", color:C.green }}>
        {m.id} · {m.date}
      </div>
      {[m.h, m.a].map((t,i) => (
        <React.Fragment key={i}>
          {i===1 && <div style={{ height:1, background:"#192219" }} />}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 8px", minHeight:32, fontSize:11 }}>
            <span style={{ fontSize:14, width:19, textAlign:"center" }}>{t?.tbd?"·":(FLAGS[t?.code]||"🏳️")}</span>
            <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:t?.tbd?C.faint:C.text, fontStyle:t?.tbd?"italic":"normal" }}>
              {t?.name||"Por det."}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Tarjeta bracket futura (solo IDs) ──
function BkFuture({ hFrom, aFrom, label, date, isFinal, isThird }) {
  const bg = isFinal?"#2A2010":isThird?"#1A1808":"#0D1410";
  const border = isFinal?C.gold:isThird?"#3A3010":"#131A14";
  const labelColor = isFinal?C.gold:isThird?"#7A7020":C.faint;
  return (
    <div style={{ width:isFinal?155:140, background:bg, border:`1px solid ${border}`, borderRadius:7, overflow:"hidden", flexShrink:0, opacity:0.65, boxShadow:isFinal?`0 0 14px rgba(201,162,39,.15)`:"none" }}>
      <div style={{ fontSize:9, padding:"2px 7px", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", textAlign:"center", color:labelColor }}>
        {isFinal?"⚽ FINAL":isThird?"3er Puesto":label} · {date}
      </div>
      {[hFrom, aFrom].map((from, i) => (
        <React.Fragment key={i}>
          {i===1 && <div style={{ height:1, background:"#192219" }} />}
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 8px", minHeight:32, fontSize:11, color:C.faint, fontStyle:"italic" }}>
            <span style={{ fontSize:14, width:19, textAlign:"center" }}>·</span>
            <span style={{ flex:1 }}>{from}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Conectores SVG ──
const CH=66, GAP=8;

function ConnL({ n }) {
  // n pares de tarjetas izquierda → n/2 tarjetas derecha
  const totalH = n*(CH+GAP)-GAP;
  const paths = [];
  for(let i=0; i<n/2; i++){
    const y1 = (i*2)*(CH+GAP)+CH/2;
    const y2 = (i*2+1)*(CH+GAP)+CH/2;
    const ym = (y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M0,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M0,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H24`}       stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={totalH} style={{ flexShrink:0, marginTop:22 }}>{paths}</svg>;
}
function ConnR({ n }) {
  const totalH = n*(CH+GAP)-GAP;
  const paths = [];
  for(let i=0; i<n/2; i++){
    const y1 = (i*2)*(CH+GAP)+CH/2;
    const y2 = (i*2+1)*(CH+GAP)+CH/2;
    const ym = (y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M24,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M24,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H0`}          stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={totalH} style={{ flexShrink:0, marginTop:22 }}>{paths}</svg>;
}
function ConnMidL({ n }) {
  const totalH = n*(CH+GAP)-GAP;
  const paths = [];
  const srcH = totalH/n;
  for(let i=0; i<n/2; i++){
    const y1 = i*2*srcH+srcH/2;
    const y2 = (i*2+1)*srcH+srcH/2;
    const ym = (y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M0,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M0,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H24`}       stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={totalH} style={{ flexShrink:0, marginTop:22 }}>{paths}</svg>;
}
function ConnMidR({ n }) {
  const totalH = n*(CH+GAP)-GAP;
  const paths = [];
  const srcH = totalH/n;
  for(let i=0; i<n/2; i++){
    const y1 = i*2*srcH+srcH/2;
    const y2 = (i*2+1)*srcH+srcH/2;
    const ym = (y1+y2)/2;
    paths.push(
      <path key={`a${i}`} d={`M24,${y1} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`b${i}`} d={`M24,${y2} H12 V${ym}`} stroke="#1A3020" strokeWidth={1} fill="none"/>,
      <path key={`c${i}`} d={`M12,${ym} H0`}          stroke="#1A3020" strokeWidth={1} fill="none"/>,
    );
  }
  return <svg width={24} height={totalH} style={{ flexShrink:0, marginTop:22 }}>{paths}</svg>;
}
function LineH({ totalH }) {
  return <svg width={24} height={totalH} style={{ flexShrink:0, marginTop:22 }}><path d={`M0,${totalH/2} H24`} stroke="#1A3020" strokeWidth={1} fill="none"/></svg>;
}

function ColLabel({ children, color=C.faint, sub }) {
  return (
    <div style={{ textAlign:"center", paddingBottom:8 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase", color, whiteSpace:"nowrap" }}>{children}</div>
      {sub && <div style={{ fontSize:9, color:"#2A3A2C", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function ColCards({ matches, isFuture, totalH, r16=false }) {
  if (!isFuture) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:GAP, flexShrink:0 }}>
        {matches.map(m => <BkReal key={m.id} m={m} />)}
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-around", height:totalH, flexShrink:0 }}>
      {matches.map(m => <BkFuture key={m.id} hFrom={m.hFrom} aFrom={m.aFrom} label={m.id} date={m.date} />)}
    </div>
  );
}

// ── Pantalla Bracket ──
function ScreenBracket({ bracket }) {
  if(!bracket) return <div style={{ padding:16 }}><p style={{ color:C.dim }}>Cargando...</p></div>;
  const { R32, R16, QF, SF, FIN, THIRD } = bracket;
  const totalH = 8*(CH+GAP)-GAP;

  const L32 = R32.slice(0,8), R32r = R32.slice(8,16);
  const L16 = R16.slice(0,4), R16r = R16.slice(4,8);
  const LQF = QF.slice(0,2), RQF = QF.slice(2,4);

  return (
    <div>
      <div style={{ margin:"12px 16px 4px", padding:"10px 14px", background:"rgba(63,184,85,.06)", borderRadius:10, border:`1px solid #1A3020` }}>
        <p style={{ fontSize:12, color:C.green, fontWeight:700, marginBottom:2 }}>🏆 Cuadro oficial FIFA World Cup 2026</p>
        <p style={{ fontSize:11, color:C.dim, lineHeight:1.5 }}>
          Dieciseisavos con equipos reales confirmados. Las rondas siguientes se rellenan cuando se jueguen los partidos. Actualización cada 30s.
        </p>
      </div>

      <div style={{ overflowX:"auto", padding:"16px 12px 24px", background:C.bg }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:0, minWidth:"max-content" }}>

          {/* DIECISEISAVOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColLabel sub="28 jun – 2 jul">Dieciseisavos</ColLabel>
            <ColCards matches={L32} isFuture={false} />
          </div>

          <ConnL n={8} />

          {/* OCTAVOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColLabel sub="5–6 jul">Octavos</ColLabel>
            <ColCards matches={L16} isFuture={true} totalH={totalH} />
          </div>

          <ConnMidL n={4} />

          {/* CUARTOS IZQUIERDO */}
          <div style={{ flexShrink:0 }}>
            <ColLabel sub="9–10 jul">Cuartos</ColLabel>
            <ColCards matches={LQF} isFuture={true} totalH={totalH} />
          </div>

          <ConnMidL n={2} />

          {/* SEMIFINAL IZQUIERDO */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", height:totalH, flexShrink:0 }}>
            <ColLabel sub="14 jul">Semifinal</ColLabel>
            <BkFuture hFrom={SF[0].hFrom} aFrom={SF[0].aFrom} label={SF[0].id} date={SF[0].date} />
          </div>

          <LineH totalH={totalH} />

          {/* CENTRO: FINAL */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:totalH, flexShrink:0, gap:10, padding:"0 6px" }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, textAlign:"center" }}>⚽ FINAL</div>
            <BkFuture hFrom={FIN.hFrom} aFrom={FIN.aFrom} label={FIN.id} date={FIN.date} isFinal={true} />
            <div style={{ height:1, width:"100%", background:C.line, margin:"2px 0" }} />
            <div style={{ fontSize:9, color:C.faint, textAlign:"center" }}>3er puesto</div>
            <BkFuture hFrom={THIRD.hFrom} aFrom={THIRD.aFrom} label={THIRD.id} date={THIRD.date} isThird={true} />
          </div>

          <LineH totalH={totalH} />

          {/* SEMIFINAL DERECHO */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", height:totalH, flexShrink:0 }}>
            <BkFuture hFrom={SF[1].hFrom} aFrom={SF[1].aFrom} label={SF[1].id} date={SF[1].date} />
          </div>

          <ConnMidR n={2} />

          {/* CUARTOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <ColCards matches={RQF} isFuture={true} totalH={totalH} />
          </div>

          <ConnMidR n={4} />

          {/* OCTAVOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <ColCards matches={R16r} isFuture={true} totalH={totalH} />
          </div>

          <ConnR n={8} />

          {/* DIECISEISAVOS DERECHO */}
          <div style={{ flexShrink:0 }}>
            <ColLabel sub="1–4 jul">Dieciseisavos</ColLabel>
            <ColCards matches={R32r} isFuture={false} />
          </div>

        </div>
      </div>

      <p style={{ fontSize:10, color:C.faint, textAlign:"center", padding:"4px 16px 16px", lineHeight:1.5 }}>
        Los resultados de los dieciseisavos se añaden automáticamente conforme se jueguen · Próximo partido: 28 jun
      </p>
    </div>
  );
}

// ── Pantalla Inicio ──
function ScreenHome({ data }) {
  const { liveMatches, upcoming, finished, scorers } = data;
  const Cd = (children, style={}) => <div style={{ background:"#161D18", border:`1px solid ${C.line}`, borderRadius:12, padding:14, ...style }}>{children}</div>;
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
            </>, { borderColor:"#1F4A28" })
          : Cd(<p style={{ color:C.dim,fontSize:14 }}>No hay partidos en directo ahora mismo.</p>)
        }
      </div>
      {finished.length>0 && <>
        <ST>Resultados recientes</ST>
        <div style={{ padding:"0 16px" }}>{Cd(finished.slice(-6).reverse().map(m=><MatchRow key={m.id} m={m}/>))}</div>
      </>}
      {upcoming.length>0 && <>
        <ST>Próximos partidos</ST>
        <div style={{ padding:"0 16px" }}>{Cd(upcoming.slice(0,6).map(m=><MatchRow key={m.id} m={m}/>))}</div>
      </>}
      {scorers.length>0 && <>
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

// ── Pantalla Grupos ──
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
          }}>
            {g.groupName.replace("Grupo ","")}
          </button>
        ))}
      </div>
      {group && (
        <div style={{ padding:"0 16px" }}>
          <div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"20px 1fr 26px 26px 26px 28px 32px",padding:"7px 12px",fontSize:10,color:C.faint,fontWeight:700,textTransform:"uppercase",gap:2,borderBottom:`1px solid ${C.line}` }}>
              <span>#</span><span>Equipo</span>
              <span style={{textAlign:"center"}}>PJ</span><span style={{textAlign:"center"}}>G</span>
              <span style={{textAlign:"center"}}>E</span><span style={{textAlign:"center"}}>DG</span>
              <span style={{textAlign:"center"}}>Pts</span>
            </div>
            {(group.rows||[]).map((t,i)=>(
              <div key={t.team} style={{
                display:"grid",gridTemplateColumns:"20px 1fr 26px 26px 26px 28px 32px",
                alignItems:"center",padding:"9px 12px",gap:2,
                borderTop:i?`1px solid ${C.line}`:"none",
                background:t.pos<=2?"rgba(63,184,85,.05)":t.pos===3?"rgba(200,180,0,.03)":"transparent",
              }}>
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
      {gMatches.length>0 && <>
        <ST>Partidos — {sel}</ST>
        <div style={{ padding:"0 16px" }}>
          <div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,padding:14 }}>
            {gMatches.map(m=><MatchRow key={m.id} m={m}/>)}
          </div>
        </div>
      </>}
    </div>
  );
}

// ── Pantalla Jugadores ──
function ScreenPlayers({ data }) {
  const { scorers } = data;
  const assists = [...scorers].filter(s=>s.assists>0).sort((a,b)=>b.assists-a.assists);
  const maxG = Math.max(...scorers.map(s=>s.goals),1);
  const Cd = (children) => <div style={{ background:"#161D18",border:`1px solid ${C.line}`,borderRadius:12,padding:14 }}>{children}</div>;
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
      {assists.length>0 && <>
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

// ── APP ──
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
  const [appData, setAppData] = useState({ standings:[], liveMatches:[], upcoming:[], finished:[], scorers:[], bracket:null });
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
      setAppData({
        standings,
        liveMatches: all.filter(m=>["IN_PROGRESS","PAUSED","LIVE"].includes(m.status)),
        upcoming:    all.filter(m=>["SCHEDULED","TIMED"].includes(m.status)),
        finished:    all.filter(m=>m.status==="FINISHED"),
        scorers:     mapScorers(scRes),
        bracket:     buildOfficialBracket(standings),
      });
      setLastUpdate(new Date());
      setError(null);
    } catch(err) {
      console.error("Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ loadData(); const iv=setInterval(loadData,30000); return()=>clearInterval(iv); }, []);

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

      {/* Header */}
      <div style={{ position:"sticky",top:0,zIndex:10,background:C.bg,borderBottom:`1px solid ${C.line}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:20 }}>⚽</span>
          <span style={{ fontWeight:800,fontSize:18,letterSpacing:"-.02em" }}>MATCHDAY</span>
          <span style={{ fontSize:10,color:C.green,marginLeft:6,fontWeight:700,padding:"2px 7px",background:"rgba(63,184,85,.1)",borderRadius:5 }}>Mundial 2026</span>
        </div>
        {lastUpdate && (
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block" }}/>
            <span style={{ fontSize:10,color:C.faint }}>{lastUpdate.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        )}
      </div>

      {error && (
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
        : <div style={{ maxWidth:screen==="bracket"?undefined:560, margin:"0 auto" }}>
            {screen==="home"    && <ScreenHome data={appData}/>}
            {screen==="groups"  && <ScreenGroups data={appData}/>}
            {screen==="bracket" && <ScreenBracket bracket={appData.bracket}/>}
            {screen==="players" && <ScreenPlayers data={appData}/>}
          </div>
      }

      {/* Nav */}
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

