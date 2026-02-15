// "use client";

// import { useState } from "react";
// import { useJobsQuery } from "@/data/use-jobs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   AlertCircle,
//   MapPin,
//   Banknote,
//   ChevronLeft,
//   ChevronRight,
//   Calendar,
// } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// export default function JobsPage() {
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const { data, isLoading, isError, error, isPlaceholderData } = useJobsQuery(
//     page,
//     pageSize,
//   );

//   const jobs = data?.data || [];
//   const meta = data?.meta;

//   if (isLoading) {
//     return (
//       <div className="flex h-[50vh] w-full items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-8">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>
//             {error instanceof Error ? error.message : "Could not load jobs."}
//           </AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
//           <p className="text-muted-foreground">
//             Overview of all posted jobs and their current status.
//           </p>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Job List</CardTitle>
//           <CardDescription>
//             Showing {(meta?.page || 1) * pageSize - pageSize + 1} to{" "}
//             {Math.min((meta?.page || 1) * pageSize, meta?.total || 0)} of{" "}
//             {meta?.total || 0} jobs.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">ID</TableHead>
//                 {/* 2nd Column: Created At */}
//                 <TableHead className="w-[120px]">Created At</TableHead>
//                 {/* 3rd Column: Posted By */}
//                 <TableHead className="w-[200px]">Posted By</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Cost</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Finished By</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {jobs.length > 0 ? (
//                 jobs.map((job) => (
//                   <TableRow
//                     key={job.id}
//                     className={isPlaceholderData ? "opacity-50" : ""}
//                   >
//                     {/* 1. ID */}
//                     <TableCell className="font-medium">#{job.id}</TableCell>

//                     {/* 2. Created At */}
//                     <TableCell>
//                       <div className="flex flex-col text-sm">
//                         <span className="flex items-center gap-1 font-medium">
//                           <Calendar className="h-3 w-3 text-muted-foreground" />
//                           {new Date(job.createdAt).toLocaleDateString()}
//                         </span>
//                         <span className="text-xs text-muted-foreground pl-4">
//                           {new Date(job.createdAt).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </div>
//                     </TableCell>

//                     {/* 3. Posted By (Image + Name + Mobile) */}
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         <Avatar className="h-8 w-8">
//                           <AvatarImage src={job.postedBy?.image || ""} />
//                           <AvatarFallback>
//                             {job.postedBy?.name?.charAt(0) || "P"}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="flex flex-col">
//                           <span className="text-sm font-medium leading-none">
//                             {job.postedBy?.name || "Unknown"}
//                           </span>
//                           <span className="text-xs text-muted-foreground mt-1">
//                             {job.postedBy?.mobile}
//                           </span>
//                         </div>
//                       </div>
//                     </TableCell>

//                     {/* 4. Description & Location */}
//                     <TableCell className="max-w-[200px]">
//                       <div className="flex flex-col gap-1">
//                         <span className="font-semibold text-xs uppercase tracking-wide text-primary/80">
//                           {job.category || "General"}
//                         </span>
//                         <span
//                           className="truncate block text-sm font-medium"
//                           title={job.description || ""}
//                         >
//                           {job.description || "No description provided"}
//                         </span>
//                         <div className="flex items-center text-xs text-muted-foreground">
//                           <MapPin className="mr-1 h-3 w-3" />
//                           {job.location}
//                         </div>
//                       </div>
//                     </TableCell>

//                     {/* 5. Cost */}
//                     <TableCell>
//                       <div className="flex items-center font-bold text-green-600 dark:text-green-400">
//                         <Banknote className="mr-1 h-4 w-4" />
//                         {job.cost}
//                       </div>
//                     </TableCell>

//                     {/* 6. Status */}
//                     <TableCell>
//                       <div className="flex flex-col gap-1 items-start">
//                         <Badge
//                           variant={
//                             job.status === "ACTIVE" ? "default" : "secondary"
//                           }
//                           className="text-[10px]"
//                         >
//                           {job.status}
//                         </Badge>
//                         {job.paymentStatus !== "PENDING" && (
//                           <Badge
//                             variant="outline"
//                             className="text-[10px] border-green-500 text-green-600"
//                           >
//                             {job.paymentStatus}
//                           </Badge>
//                         )}
//                       </div>
//                     </TableCell>

//                     {/* 7. Finished By (Image + Name + Mobile) */}
//                     <TableCell>
//                       {job.finishedBy ? (
//                         <div className="flex items-center gap-3">
//                           <Avatar className="h-8 w-8">
//                             <AvatarImage src={job.finishedBy.image || ""} />
//                             <AvatarFallback>
//                               {job.finishedBy.name?.charAt(0) || "F"}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div className="flex flex-col">
//                             <span className="text-sm font-medium leading-none">
//                               {job.finishedBy.name || "Unknown"}
//                             </span>
//                             <span className="text-xs text-muted-foreground mt-1">
//                               {job.finishedBy.mobile}
//                             </span>
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-xs text-muted-foreground italic pl-2">
//                           --
//                         </span>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={7} className="h-24 text-center">
//                     No jobs found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>

//         {/* Footer Navigation (Unchanged) */}
//         <CardFooter className="flex items-center justify-between border-t p-4">
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-muted-foreground">Rows per page</span>
//             <Select
//               value={pageSize.toString()}
//               onValueChange={(val) => {
//                 setPageSize(Number(val));
//                 setPage(1);
//               }}
//             >
//               <SelectTrigger className="h-8 w-[70px]">
//                 <SelectValue placeholder={pageSize} />
//               </SelectTrigger>
//               <SelectContent side="top">
//                 {[10, 20, 50].map((size) => (
//                   <SelectItem key={size} value={size.toString()}>
//                     {size}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="text-sm font-medium mr-2">
//               Page {meta?.page} of {meta?.totalPages}
//             </div>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => setPage((old) => Math.max(old - 1, 1))}
//               disabled={page === 1 || isPlaceholderData}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => {
//                 if (!isPlaceholderData && meta?.page! < meta?.totalPages!) {
//                   setPage((old) => old + 1);
//                 }
//               }}
//               disabled={
//                 isPlaceholderData || (meta ? page >= meta.totalPages : true)
//               }
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useJobsQuery, Job } from "@/data/use-jobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  MapPin,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  User,
  Phone,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for the details modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading, isError, error, isPlaceholderData } = useJobsQuery(
    page,
    pageSize,
  );

  const jobs = data?.data || [];
  const meta = data?.meta;

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Could not load jobs."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">
            Overview of all posted jobs and their current status.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job List</CardTitle>
          <CardDescription>
            Showing {(meta?.page || 1) * pageSize - pageSize + 1} to{" "}
            {Math.min((meta?.page || 1) * pageSize, meta?.total || 0)} of{" "}
            {meta?.total || 0} jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead className="w-[120px]">Created At</TableHead>
                <TableHead className="w-[200px]">Posted By</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                {/* CHANGED: Replaced "Finished By" with "Actions" */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className={isPlaceholderData ? "opacity-50" : ""}
                  >
                    {/* 1. ID */}
                    <TableCell className="font-medium">#{job.id}</TableCell>

                    {/* 2. Created At */}
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground pl-4">
                          {new Date(job.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* 3. Posted By */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={job.postedBy?.image || ""} />
                          <AvatarFallback>
                            {job.postedBy?.name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">
                            {job.postedBy?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {job.postedBy?.mobile}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 4. Description */}
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-xs uppercase tracking-wide text-primary/80">
                          {job.category || "General"}
                        </span>
                        <span
                          className="truncate block text-sm font-medium"
                          title={job.description || ""}
                        >
                          {job.description || "No description provided"}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {job.location}
                        </div>
                      </div>
                    </TableCell>

                    {/* 5. Cost */}
                    <TableCell>
                      <div className="flex items-center font-bold text-green-600 dark:text-green-400">
                        <Banknote className="mr-1 h-4 w-4" />
                        {job.cost}
                      </div>
                    </TableCell>

                    {/* 6. Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={
                            job.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {job.status}
                        </Badge>
                        {job.paymentStatus !== "PENDING" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-green-500 text-green-600"
                          >
                            {job.paymentStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* 7. ACTIONS (New) */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(job)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No jobs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-4">
          {/* Pagination Logic (Kept same as before) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium mr-2">
              Page {meta?.page} of {meta?.totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isPlaceholderData}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (!isPlaceholderData && meta?.page! < meta?.totalPages!) {
                  setPage((old) => old + 1);
                }
              }}
              disabled={
                isPlaceholderData || (meta ? page >= meta.totalPages : true)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* --- DETAILS MODAL --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details #{selectedJob?.id}</DialogTitle>
            <DialogDescription>
              Complete information about the job and its completion status.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="grid gap-6 py-4">
              {/* 1. Photos Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Initial Photo
                  </h4>
                  <div className="relative aspect-video rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                    {selectedJob.jobPhoto ? (
                      // Using standard img tag if Next/Image config is tricky with external URLs,
                      // otherwise use <Image fill ... />
                      <img
                        src={selectedJob.jobPhoto}
                        alt="Job Start"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No Photo
                      </span>
                    )}
                  </div>
                </div>

                {/* After Photo */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Completion Photo
                  </h4>
                  <div className="relative aspect-video rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                    {selectedJob.jobPhotoDone ? (
                      <img
                        src={selectedJob.jobPhotoDone}
                        alt="Job Done"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        Job not finished yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Finished By Details */}
              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" /> Executed By
                </h4>

                {selectedJob.finishedBy ? (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={selectedJob.finishedBy.image || ""} />
                      <AvatarFallback>
                        {selectedJob.finishedBy.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-medium text-lg leading-none">
                        {selectedJob.finishedBy.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {selectedJob.finishedBy.mobile}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <Calendar className="h-3 w-3" />
                        Finished:{" "}
                        {selectedJob.finishedAt
                          ? new Date(selectedJob.finishedAt).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 text-muted-foreground text-sm italic">
                    This job has not been completed by anyone yet.
                  </div>
                )}
              </div>

              {/* 3. Job Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Description</span>
                  <p className="font-medium">{selectedJob.description}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedJob.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
