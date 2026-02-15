"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTokensQuery,
  useUpdateTokenMutation,
  Token,
} from "@/data/use-tokens";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { formatMobile } from "@/utils/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Utility Hook: Debounce ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

type StatusFilter = "ALL" | "REQUESTED" | "ISSUED";

export default function TokensPage() {
  // 1. Filter & Search State
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("REQUESTED");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Debounce search to prevent API spamming (waits 500ms after typing)
  const debouncedSearch = useDebounce(searchQuery, 500);

  // 2. Pagination State
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10); // Fixed limit, or add a selector to change it

  // 3. Local State for Quantity Inputs
  const [quantities, setQuantities] = React.useState<Record<string, number>>(
    {},
  );

  // 4. Server Data Fetching (Passes debounced search to backend)
  const { data, isLoading, isError, isPlaceholderData } = useTokensQuery(
    statusFilter,
    page,
    limit,
    debouncedSearch,
  );

  const updateTokenMutation = useUpdateTokenMutation();

  const tokens = data?.data || [];
  const meta = data?.meta;

  // Reset page to 1 when Filters or Search change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  // --- Handlers ---

  const handleQuantityChange = (id: string, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleIssueToken = (token: Token) => {
    // Use local input state or fallback to default quantity
    const qtyToIssue = quantities[token.id] ?? token.quantity;

    if (!qtyToIssue || qtyToIssue <= 0) return;

    updateTokenMutation.mutate({
      id: token.id,
      tokenCode: token.tokenCode,
      mobileNumber: token.mobileNumber,
      quantity: qtyToIssue,
      tokenStatus: "ISSUED",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Token Management</CardTitle>
              <CardDescription>
                Manage incoming token requests and issuance.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Global Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Global search (Code, Mobile...)"
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Tabs */}
              <Tabs
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <TabsList>
                  <TabsTrigger value="REQUESTED">Pending</TabsTrigger>
                  <TabsTrigger value="ISSUED">Issued</TabsTrigger>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Token</TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Yandex Code</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton Loading State
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-red-500"
                    >
                      Failed to load data. Please try again.
                    </TableCell>
                  </TableRow>
                ) : tokens.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No tokens found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((token) => (
                    <TableRow
                      key={token.id}
                      className={isPlaceholderData ? "opacity-50" : ""}
                    >
                      {/* Token Code */}
                      <TableCell className="font-medium font-mono text-primary">
                        {token.tokenCode}
                      </TableCell>

                      {/* User Details */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={token.postedBy?.image || ""} />
                            <AvatarFallback>
                              {token.postedBy?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {token.postedBy?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatMobile(token.mobileNumber)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Order Info */}
                      <TableCell>{token.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {token.orderCode}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(token.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs">
                            {format(new Date(token.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>

                      {/* Quantity Input */}
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[token.id] ?? token.quantity}
                          onChange={(e) =>
                            handleQuantityChange(token.id, e.target.value)
                          }
                          disabled={
                            token.tokenStatus === "ISSUED" ||
                            updateTokenMutation.isPending
                          }
                          className="w-16 h-8"
                        />
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            token.tokenStatus === "REQUESTED"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {token.tokenStatus === "REQUESTED"
                            ? "Pending"
                            : "Issued"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        {token.tokenStatus === "REQUESTED" ? (
                          <Button
                            size="sm"
                            onClick={() => handleIssueToken(token)}
                            disabled={updateTokenMutation.isPending}
                          >
                            Issue
                          </Button>
                        ) : (
                          <div className="text-xs text-muted-foreground flex flex-col items-end">
                            <p>Issued</p>
                            {token.receivedAt && (
                              <>
                                <span>
                                  {format(
                                    new Date(token.receivedAt),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                                <span className="text-xs">
                                  {format(new Date(token.receivedAt), "h:mm a")}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {meta && (
            <div className="flex items-center justify-between space-x-2 py-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{(meta.page - 1) * meta.limit + 1}</strong> to{" "}
                <strong>{Math.min(meta.page * meta.limit, meta.total)}</strong>{" "}
                of <strong>{meta.total}</strong> results
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((old) => Math.max(old - 1, 1))}
                  disabled={page === 1 || isPlaceholderData}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isPlaceholderData && meta.page < meta.totalPages) {
                      setPage((old) => old + 1);
                    }
                  }}
                  disabled={
                    isPlaceholderData || (meta ? page >= meta.totalPages : true)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
