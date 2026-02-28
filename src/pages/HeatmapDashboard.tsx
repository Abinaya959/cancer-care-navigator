import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { simulateIntervention } from '@/lib/ml-engine';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DistrictData, CancerStage } from '@/lib/types';
import { X } from 'lucide-react';

const GEO_URL = '/tamil-nadu-districts.geojson';

type MetricKey = 'fragilityScore' | 'avgDelay' | 'dropoutRate' | 'stageIV';

const METRIC_LABELS: Record<MetricKey, string> = {
  fragilityScore: 'CSFI Score',
  avgDelay: 'Avg Delay (days)',
  dropoutRate: 'Dropout Rate (%)',
  stageIV: 'Stage IV (%)',
};

// Map GeoJSON district names → our data district names
// The GeoJSON uses 2011 census names; newer districts (post-bifurcation) are mapped to parent
const DISTRICT_NAME_MAP: Record<string, string> = {
  'Ariyalur': 'Ariyalur',
  'Chennai': 'Chennai',
  'Coimbatore': 'Coimbatore',
  'Cuddalore': 'Cuddalore',
  'Dharmapuri': 'Dharmapuri',
  'Dindigul': 'Dindigul',
  'Erode': 'Erode',
  'Kancheepuram': 'Kanchipuram',
  'Kanchipuram': 'Kanchipuram',
  'Kanyakumari': 'Kanniyakumari',
  'Kanniyakumari': 'Kanniyakumari',
  'Karur': 'Karur',
  'Krishnagiri': 'Krishnagiri',
  'Madurai': 'Madurai',
  'Nagapattinam': 'Nagapattinam',
  'Namakkal': 'Namakkal',
  'Nilgiris': 'Nilgiris',
  'The Nilgiris': 'Nilgiris',
  'Perambalur': 'Perambalur',
  'Pudukkottai': 'Pudukkottai',
  'Ramanathapuram': 'Ramanathapuram',
  'Salem': 'Salem',
  'Sivaganga': 'Sivaganga',
  'Sivagangai': 'Sivaganga',
  'Thanjavur': 'Thanjavur',
  'Theni': 'Theni',
  'Thiruvallur': 'Tiruvallur',
  'Tiruvallur': 'Tiruvallur',
  'Thiruvarur': 'Tiruvarur',
  'Tiruvarur': 'Tiruvarur',
  'Thoothukkudi': 'Thoothukudi',
  'Thoothukudi': 'Thoothukudi',
  'Tuticorin': 'Thoothukudi',
  'Tiruchirappalli': 'Tiruchirappalli',
  'Tiruchirapalli': 'Tiruchirappalli',
  'Trichy': 'Tiruchirappalli',
  'Tirunelveli': 'Tirunelveli',
  'Tiruppur': 'Tiruppur',
  'Tiruvannamalai': 'Tiruvannamalai',
  'Vellore': 'Vellore',
  'Viluppuram': 'Viluppuram',
  'Villupuram': 'Viluppuram',
  'Virudhunagar': 'Virudhunagar',
};

function resolveDistrictName(geoName: string): string {
  if (DISTRICT_NAME_MAP[geoName]) return DISTRICT_NAME_MAP[geoName];
  // Try case-insensitive match
  const lower = geoName.toLowerCase();
  for (const [key, val] of Object.entries(DISTRICT_NAME_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return geoName;
}

function getMetricValue(d: DistrictData, metric: MetricKey): number {
  if (metric === 'stageIV') return d.stageDistribution['Stage IV'] ?? 0;
  return d[metric];
}

function getColor(value: number, metric: MetricKey, maxVal: number): string {
  let ratio: number;
  if (metric === 'fragilityScore') {
    ratio = value / 100;
  } else {
    ratio = maxVal > 0 ? value / maxVal : 0;
  }
  // Interpolate: green → yellow → red
  const clamped = Math.min(Math.max(ratio, 0), 1);
  if (clamped <= 0.3) {
    const t = clamped / 0.3;
    // green to yellow-green
    const h = 152 - t * 52; // 152 → 100
    return `hsl(${h}, 60%, ${40 + t * 5}%)`;
  } else if (clamped <= 0.6) {
    const t = (clamped - 0.3) / 0.3;
    const h = 100 - t * 62; // 100 → 38
    return `hsl(${h}, ${60 + t * 32}%, ${45 - t * 5}%)`;
  } else {
    const t = (clamped - 0.6) / 0.4;
    const h = 38 - t * 38; // 38 → 0
    return `hsl(${h}, ${92 - t * 20}%, ${50 - t * 10}%)`;
  }
}

const HeatmapDashboard = () => {
  const { districtData, patients } = useData();
  const [metric, setMetric] = useState<MetricKey>('fragilityScore');
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const districtMap = useMemo(() => {
    const map: Record<string, DistrictData> = {};
    districtData.forEach(d => { map[d.district] = d; });
    return map;
  }, [districtData]);

  const maxVal = useMemo(() => {
    const vals = districtData.map(d => getMetricValue(d, metric));
    return Math.max(...vals, 1);
  }, [districtData, metric]);

  const hoveredData = hoveredDistrict ? districtMap[hoveredDistrict] : null;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 });
  }, []);

  const handleDistrictClick = useCallback((districtName: string) => {
    const data = districtMap[districtName];
    if (data) {
      setSelectedDistrict(data);
      setDrawerOpen(true);
    }
  }, [districtMap]);

  // Simulated improvement for selected district
  const simulatedResult = useMemo(() => {
    if (!selectedDistrict) return null;
    const districtPatients = patients.filter(p => p.district === selectedDistrict.district);
    if (districtPatients.length === 0) return null;
    return simulateIntervention(districtPatients, {
      biopsyWaitReduction: 30,
      referralSpeedUp: 25,
      screeningIncrease: 20,
      additionalPathologists: 2,
      radiotherapyMachineIncrease: 3,
      fastTrackReferral: true,
    });
  }, [selectedDistrict, patients]);

  const stageChartData = useMemo(() => {
    if (!selectedDistrict) return [];
    return (['Stage I', 'Stage II', 'Stage III', 'Stage IV'] as CancerStage[]).map(stage => ({
      name: stage,
      percentage: selectedDistrict.stageDistribution[stage],
    }));
  }, [selectedDistrict]);

  const sorted = useMemo(() => [...districtData].sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric)), [districtData, metric]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Inequality Heatmap – Tamil Nadu</h1>
        <p className="text-sm text-muted-foreground">
          Interactive choropleth map · All 38 districts · Color-coded by selected metric
        </p>
      </div>

      {/* Metric toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(METRIC_LABELS) as MetricKey[]).map(key => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              metric === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
          >
            {METRIC_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Map */}
        <motion.div
          key={metric}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-xl border clinical-shadow p-4 relative"
          onMouseMove={handleMouseMove}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [78.9, 10.8],
              scale: 5000,
            }}
            width={600}
            height={750}
            style={{ width: '100%', height: 'auto', maxHeight: '70vh' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const geoName = geo.properties?.district || geo.properties?.dtname || geo.properties?.NAME_2 || geo.properties?.name || '';
                  const resolvedName = resolveDistrictName(geoName);
                  const data = districtMap[resolvedName];
                  const value = data ? getMetricValue(data, metric) : 0;
                  const fillColor = data ? getColor(value, metric, maxVal) : 'hsl(var(--muted))';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="hsl(0, 0%, 100%)"
                      strokeWidth={0.8}
                      style={{
                        default: { outline: 'none', transition: 'fill 0.3s ease' },
                        hover: { outline: 'none', strokeWidth: 2, stroke: 'hsl(var(--foreground))', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() => setHoveredDistrict(resolvedName)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => handleDistrictClick(resolvedName)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="fixed z-50 pointer-events-none bg-card border rounded-lg p-3 clinical-shadow-md text-xs"
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <p className="font-semibold text-foreground text-sm">{hoveredData.district}</p>
                <div className="mt-1.5 space-y-0.5 text-muted-foreground">
                  <p>CSFI: <span className="font-mono font-medium text-foreground">{hoveredData.fragilityScore}</span></p>
                  <p>Avg Delay: <span className="font-mono font-medium text-foreground">{hoveredData.avgDelay}d</span></p>
                  <p>Dropout: <span className="font-mono font-medium text-foreground">{hoveredData.dropoutRate}%</span></p>
                  <p>Stage IV: <span className="font-mono font-medium text-foreground">{hoveredData.stageDistribution['Stage IV']}%</span></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border rounded-lg p-3 text-xs space-y-1.5">
            <p className="font-semibold text-foreground text-[11px]">Fragility Legend</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm" style={{ background: 'hsl(152, 60%, 40%)' }} />
              <span className="text-muted-foreground">Low (0–30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm" style={{ background: 'hsl(38, 92%, 50%)' }} />
              <span className="text-muted-foreground">Moderate (31–60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded-sm" style={{ background: 'hsl(0, 72%, 45%)' }} />
              <span className="text-muted-foreground">High (61–100)</span>
            </div>
          </div>
        </motion.div>

        {/* Table sidebar */}
        <div className="bg-card rounded-xl border clinical-shadow p-4 overflow-y-auto max-h-[70vh]">
          <h3 className="text-xs font-semibold text-foreground mb-3">District Rankings</h3>
          <div className="space-y-1">
            {sorted.map((d, i) => {
              const val = getMetricValue(d, metric);
              return (
                <button
                  key={d.district}
                  onClick={() => handleDistrictClick(d.district)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/60 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono w-5">{i + 1}</span>
                    <span className="font-medium text-foreground truncate max-w-[140px]">{d.district}</span>
                  </span>
                  <span
                    className="font-mono font-medium px-1.5 py-0.5 rounded text-[11px]"
                    style={{
                      color: getColor(val, metric, maxVal),
                    }}
                  >
                    {val}{metric === 'dropoutRate' || metric === 'stageIV' ? '%' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-card rounded-xl border p-5 clinical-shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">District</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Pop. (K)</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Patients</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">CSFI</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Avg Delay</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Dropout %</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Screening %</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Onco Ctrs</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">RT Machines</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Path. Index</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.district} className="border-b border-border/50 cursor-pointer hover:bg-muted/30" onClick={() => handleDistrictClick(d.district)}>
                <td className="p-3 font-medium">{d.district}</td>
                <td className="p-3 text-muted-foreground font-mono">{d.population}</td>
                <td className="p-3 text-muted-foreground">{d.patientCount}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                    d.fragilityScore >= 61 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    d.fragilityScore >= 31 ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-success/10 text-success border-success/20'
                  }`}>{d.fragilityScore}</span>
                </td>
                <td className="p-3 font-mono">{d.avgDelay}d</td>
                <td className="p-3 font-mono">{d.dropoutRate}%</td>
                <td className="p-3 font-mono">{d.screeningCoverage}%</td>
                <td className="p-3 font-mono">{d.oncologyCenters}</td>
                <td className="p-3 font-mono">{d.radiotherapyMachines}</td>
                <td className="p-3 font-mono">{d.pathologistIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* District Analytics Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedDistrict?.district} – District Analytics</SheetTitle>
            <SheetDescription>
              Detailed metrics and simulated intervention impact
            </SheetDescription>
          </SheetHeader>

          {selectedDistrict && (
            <div className="mt-4 space-y-5 px-1">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">CSFI Score</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDistrict.fragilityScore}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Avg Delay</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDistrict.avgDelay}d</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Dropout Rate</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDistrict.dropoutRate}%</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Screening</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDistrict.screeningCoverage}%</p>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-xs">
                <p className="font-semibold text-foreground text-sm">Infrastructure</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Oncology Centers</span><span className="font-mono text-foreground">{selectedDistrict.oncologyCenters}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">RT Machines</span><span className="font-mono text-foreground">{selectedDistrict.radiotherapyMachines}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pathologist Index</span><span className="font-mono text-foreground">{selectedDistrict.pathologistIndex}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Population</span><span className="font-mono text-foreground">{(selectedDistrict.population / 1000).toFixed(0)}K</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Patients</span><span className="font-mono text-foreground">{selectedDistrict.patientCount}</span></div>
              </div>

              {/* Stage distribution chart */}
              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Stage at Diagnosis</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Simulated improvement */}
              {simulatedResult && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-2">
                  <p className="font-semibold text-foreground text-sm">Simulated Improvement</p>
                  <p className="text-[10px] text-muted-foreground">With standard intervention package applied:</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-success">
                        -{simulatedResult.originalAvgCSFI - simulatedResult.newAvgCSFI}
                      </p>
                      <p className="text-[10px] text-muted-foreground">CSFI</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">
                        -{simulatedResult.originalAvgDelay - simulatedResult.newAvgDelay}d
                      </p>
                      <p className="text-[10px] text-muted-foreground">Delay</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">
                        -{simulatedResult.originalStageIVRate - simulatedResult.newStageIVRate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Stage IV</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HeatmapDashboard;
