"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("h-full w-full", className)} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />,
)
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartTooltipItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  color?: string
}

const ChartTooltipItem = React.forwardRef<HTMLDivElement, ChartTooltipItemProps>(
  ({ className, label, value, color, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between space-x-8", className)} {...props}>
      <div className="flex items-center">
        {color && <div className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  ),
)
ChartTooltipItem.displayName = "ChartTooltipItem"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-4", className)} {...props} />
  ),
)
ChartLegend.displayName = "ChartLegend"

interface ChartLegendItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  color: string
}

const ChartLegendItem = React.forwardRef<HTMLDivElement, ChartLegendItemProps>(
  ({ className, label, color, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props}>
      <div className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  ),
)
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartLegend, ChartLegendItem, ChartTooltip, ChartTooltipContent, ChartTooltipItem }

