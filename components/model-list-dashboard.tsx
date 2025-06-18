"use client"

import { useState } from "react"
import type { ModelConfig } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  TrendingUp,
  Brain,
  ImageIcon,
  MessageSquare,
} from "lucide-react"

interface ModelListDashboardProps {
  models: ModelConfig[]
  onViewModel: (model: ModelConfig) => void
  onEditModel: (model: ModelConfig) => void
  onDeleteModel: (modelId: string) => void
}

export function ModelListDashboard({ models, onViewModel, onEditModel, onDeleteModel }: ModelListDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null)

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || model.type === filterType
    return matchesSearch && matchesFilter
  })

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case "regression":
        return <TrendingUp className="w-5 h-5" />
      case "classification":
        return <MessageSquare className="w-5 h-5" />
      case "image_classification":
        return <ImageIcon className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getModelTypeBadgeColor = (type: string) => {
    switch (type) {
      case "regression":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "classification":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "image_classification":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search models by name or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="regression">Regression</SelectItem>
            <SelectItem value="classification">Classification</SelectItem>
            <SelectItem value="image_classification">Image Classification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{models.length}</p>
              </div>
              <Brain className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regression</p>
                <p className="text-2xl font-bold">{models.filter((m) => m.type === "regression").length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Classification</p>
                <p className="text-2xl font-bold">{models.filter((m) => m.type === "classification").length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Image Models</p>
                <p className="text-2xl font-bold">{models.filter((m) => m.type === "image_classification").length}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No models found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first machine learning model."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Card key={model.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getModelTypeIcon(model.type)}
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge className={getModelTypeBadgeColor(model.type)}>{model.type.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewModel(model)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditModel(model)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Model
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteModelId(model.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Model
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">{model.purpose}</CardDescription>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endpoint:</span>
                    <span className="font-mono text-xs truncate max-w-32" title={model.endpoint}>
                      {model.endpoint}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inputs:</span>
                    <span>{model.inputs.length} fields</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(model.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => onViewModel(model)} className="flex-1" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button onClick={() => onEditModel(model)} variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteModelId} onOpenChange={() => setDeleteModelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this model? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteModelId) {
                  onDeleteModel(deleteModelId)
                  setDeleteModelId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
