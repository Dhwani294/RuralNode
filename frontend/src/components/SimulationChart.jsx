import React, { useMemo } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

// --- FIXED: GENERATE SEEDS OUTSIDE THE COMPONENT ---
// This satisfies the Purity linter because the function itself 
// doesn't call Math.random() during its execution.
const STATIC_DEMAND_SEEDS = Array.from({ length: 60 }, () => Math.random());
const STATIC_PARTICIPATION_SEEDS = Array.from({ length: 60 }, () => Math.random());

const SimulationChart = () => {
  const simulationData = useMemo(() => {
    const days = 60;
    const initialCash = 50000;
    const marginPerUnit = 20;
    const baseCost = 80;
    const bulkCost = 75;
    const deliveryFee = 100;
    const shelfLifeLimit = 10;

    let stdCash = initialCash;
    let stdStock = 50;
    let stdBatches = [{ qty: 50, life: shelfLifeLimit }];
    
    let aiCash = initialCash;
    let aiStock = 50;
    let aiBatches = [{ qty: 50, life: shelfLifeLimit }];

    const data = [];

    const processDay = (batches, demand) => {
      let sales = 0;
      let remainingDemand = demand;
      
      batches.forEach(batch => {
        if (remainingDemand > 0 && batch.qty > 0) {
          const sold = Math.min(batch.qty, remainingDemand);
          batch.qty -= sold;
          remainingDemand -= sold;
          sales += sold;
        }
      });

      const newBatches = batches
        .map(b => ({ ...b, life: b.life - 1 }))
        .filter(b => b.life > 0 && b.qty > 0);

      const totalStock = newBatches.reduce((sum, b) => sum + b.qty, 0);
      return { newBatches, sales, totalStock };
    };

    for (let day = 0; day < days; day++) {
      const isFestival = (day > 20 && day < 25);
      
      // Using the static seeds generated at the top of the file
      const dailyDemand = isFestival 
        ? Math.floor(STATIC_DEMAND_SEEDS[day] * 6 + 12) 
        : Math.floor(STATIC_DEMAND_SEEDS[day] * 6 + 2);

      // Traditional Logic
      if (stdStock < 20) {
        stdCash -= (40 * baseCost) + deliveryFee;
        stdBatches.push({ qty: 40, life: shelfLifeLimit });
        stdStock += 40;
      }

      // RuralNode Logic
      const target = isFestival ? 50 : 15;
      if (aiStock < target) {
        let needed = isFestival ? (target - aiStock) : Math.min(target - aiStock, 10);
        const neighborParticipation = STATIC_PARTICIPATION_SEEDS[day] > 0.3;
        
        const unitCost = (neighborParticipation || needed >= 50) ? bulkCost : baseCost;
        const delivery = (neighborParticipation || needed >= 50) ? deliveryFee / 4 : deliveryFee;

        aiCash -= (needed * unitCost) + delivery;
        aiBatches.push({ qty: needed, life: shelfLifeLimit });
        aiStock += needed;
      }

      const stdRes = processDay(stdBatches, dailyDemand);
      stdBatches = stdRes.newBatches;
      stdStock = stdRes.totalStock;
      stdCash += (stdRes.sales * (baseCost + marginPerUnit));

      const aiRes = processDay(aiBatches, dailyDemand);
      aiBatches = aiRes.newBatches;
      aiStock = aiRes.totalStock;
      aiCash += (aiRes.sales * (baseCost + marginPerUnit));

      data.push({
        day: `Day ${day + 1}`,
        Traditional: Math.round(stdCash + (stdStock * baseCost)),
        GraminRoute: Math.round(aiCash + (aiStock * baseCost)),
      });
    }
    return data;
  }, []); 

  if (!simulationData.length) return null;

  const profitIncrease = simulationData[59].GraminRoute - simulationData[59].Traditional;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600"/> 
            Projected Wealth Growth (60 Days)
          </h3>
          <p className="text-xs text-gray-400 font-medium">STABLE SIMULATION MODEL</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-green-600 flex items-center gap-1">
            +₹{profitIncrease.toLocaleString()} <ArrowUpRight size={28}/>
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={simulationData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day" hide />
            <YAxis domain={['auto', 'auto']} fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
            <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
               formatter={(val) => `₹${val.toLocaleString()}`} 
            />
            <Legend />
            <Line type="monotone" dataKey="Traditional" stroke="#9ca3af" strokeDasharray="5 5" dot={false} />
            <Area type="monotone" dataKey="GraminRoute" stroke="#059669" fillOpacity={0.1} fill="#059669" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulationChart;