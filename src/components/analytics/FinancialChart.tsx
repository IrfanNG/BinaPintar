
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FinancialChartProps {
    data: {
        status: string;
        amount: number;
    }[];
}

export function FinancialChart({ data }: FinancialChartProps) {
    // Colors for the bars: Paid (Green), Pending (Amber), Approved (Blue)
    const getBarColor = (status: string) => {
        switch (status) {
            case 'Paid': return '#10b981'; // emerald-500
            case 'Pending': return '#f59e0b'; // amber-500
            case 'Approved': return '#3b82f6'; // blue-500
            default: return '#64748b';
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
                    <p className="font-semibold text-slate-900">{label}</p>
                    <p className="text-sm text-slate-600">
                        RM {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of claim statuses</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="status"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `RM${value / 1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={50}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
