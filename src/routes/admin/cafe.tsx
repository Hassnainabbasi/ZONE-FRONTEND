import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  toast,
} from "sonner";

import {
  Loader2,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Switch,
} from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  PageHeader,
  StatCard,
} from "@/components/admin/AdminShell";

import {
  cn,
} from "@/lib/utils";

import {
  cafeApi,
  type CafeCategory,
  type CafeItem,
  type CafeOrder,
  type CafeStats,
} from "@/services/cafeApi";

const title =
  "Cafe & Food Menu Orders | Nexus Arena Admin";

const description =
  "Create cafe orders, manage menu items, monitor stock and track cafe sales.";

export const Route =
  createFileRoute(
    "/admin/cafe",
  )({
    head: () => ({
      meta: [
        {
          title,
        },

        {
          name:
            "description",

          content:
            description,
        },
      ],
    }),

    component:
      CafePage,
  });

const tone: Record<
  string,
  string
> = {
  Pending:
    "bg-gold/15 text-gold",

  Preparing:
    "bg-neon-cyan/15 text-neon-cyan",

  Served:
    "bg-neon-green/15 text-neon-green",

  Cancelled:
    "bg-neon-red/15 text-neon-red",
};

const categories:
  CafeCategory[] = [
  "Drinks",
  "Hot Drinks",
  "Fast Food",
  "Snacks",
  "Desserts",
  "Other",
];

const emptyItemForm = {
  name: "",

  category:
    "Drinks" as CafeCategory,

  price: 0,

  stock: 0,

  lowStockAt: 20,

  active: true,
};

/* =========================================================
   PAGE
========================================================= */

function CafePage() {
  const [
    orders,
    setOrders,
  ] =
    useState<
      CafeOrder[]
    >([]);

  const [
    items,
    setItems,
  ] =
    useState<
      CafeItem[]
    >([]);

  const [
    stats,
    setStats,
  ] =
    useState<CafeStats>({
      salesToday: 0,

      totalOrdersToday:
        0,

      itemsSoldToday: 0,

      openOrders: 0,

      averageOrderValue:
        0,

      lowStockItems: 0,
    });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    itemFormOpen,
    setItemFormOpen,
  ] = useState(false);

  const [
    orderFormOpen,
    setOrderFormOpen,
  ] = useState(false);

  const [
    itemForm,
    setItemForm,
  ] =
    useState(
      emptyItemForm,
    );

  /*
   * Order quantities:
   * { itemId: quantity }
   */
  const [
    quantities,
    setQuantities,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    station,
    setStation,
  ] = useState("");

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    bookingId,
    setBookingId,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("Cash");

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState<
      "Unpaid" | "Paid"
    >("Paid");

  const [
    orderNotes,
    setOrderNotes,
  ] = useState("");

  const [
    creatingOrder,
    setCreatingOrder,
  ] = useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadData() {
    try {
      setLoading(true);

      const [
        orderResponse,
        itemResponse,
        statResponse,
      ] =
        await Promise.all([
          cafeApi.getOrders(),

          cafeApi.getItems(),

          cafeApi.getStats(),
        ]);

      setOrders(
        orderResponse.data,
      );

      setItems(
        itemResponse.data,
      );

      setStats(
        statResponse.data,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load cafe",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  /* =======================================================
     ORDER CALCULATION
  ======================================================= */

  const activeItems =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.active,
        ),
      [items],
    );

  const selectedOrderItems =
    useMemo(
      () =>
        activeItems
          .filter(
            (item) =>
              Number(
                quantities[
                  item._id
                ] || 0,
              ) > 0,
          )
          .map(
            (item) => ({
              item,

              quantity:
                Number(
                  quantities[
                    item._id
                  ] || 0,
                ),
            }),
          ),
      [
        activeItems,
        quantities,
      ],
    );

  const orderTotal =
    useMemo(
      () =>
        selectedOrderItems.reduce(
          (
            total,
            row,
          ) =>
            total +
            row.item.price *
              row.quantity,

          0,
        ),
      [
        selectedOrderItems,
      ],
    );

  /* =======================================================
     CREATE ORDER
  ======================================================= */

  async function createOrder() {
    if (
      !selectedOrderItems.length
    ) {
      toast.error(
        "Select at least one item",
      );

      return;
    }

    try {
      setCreatingOrder(
        true,
      );

      const response =
        await cafeApi.createOrder(
          {
            /*
             * All optional.
             */
            station:
              station.trim(),

            customerName:
              customerName.trim(),

            bookingId:
              bookingId.trim(),

            orderSource:
              "Admin",

            items:
              selectedOrderItems.map(
                (row) => ({
                  itemId:
                    row.item._id,

                  quantity:
                    row.quantity,
                }),
              ),

            paymentStatus,

            paymentMethod:
              paymentStatus ===
              "Paid"
                ? paymentMethod
                : "",

            notes:
              orderNotes.trim(),
          },
        );

      toast.success(
        `Order ${response.data.orderId} created`,
      );

      setQuantities({});

      setStation("");

      setCustomerName("");

      setBookingId("");

      setOrderNotes("");

      setOrderFormOpen(
        false,
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create order",
      );
    } finally {
      setCreatingOrder(
        false,
      );
    }
  }

  /* =======================================================
     ORDER STATUS
  ======================================================= */

  async function advance(
    order: CafeOrder,
  ) {
    if (
      order.status ===
        "Served" ||
      order.status ===
        "Cancelled"
    ) {
      return;
    }

    const status =
      order.status ===
      "Pending"
        ? "Preparing"
        : "Served";

    try {
      await cafeApi.updateOrderStatus(
        order._id,
        status,
      );

      toast.success(
        `${order.orderId} updated`,
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update order",
      );
    }
  }

  async function cancelOrder(
    order: CafeOrder,
  ) {
    if (
      !window.confirm(
        `Cancel ${order.orderId}? Stock will be returned.`,
      )
    ) {
      return;
    }

    try {
      await cafeApi.updateOrderStatus(
        order._id,
        "Cancelled",
      );

      toast.success(
        `${order.orderId} cancelled`,
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel order",
      );
    }
  }

  /* =======================================================
     CREATE ITEM
  ======================================================= */

  async function createItem() {
    if (
      !itemForm.name.trim()
    ) {
      toast.error(
        "Item name required",
      );

      return;
    }

    try {
      await cafeApi.createItem(
        itemForm,
      );

      toast.success(
        "Cafe item added",
      );

      setItemForm(
        emptyItemForm,
      );

      setItemFormOpen(
        false,
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add item",
      );
    }
  }

  /* =======================================================
     SAVE ITEM
  ======================================================= */

  async function saveItem(
    item: CafeItem,
  ) {
    try {
      await cafeApi.updateItem(
        item._id,
        {
          price:
            item.price,

          stock:
            item.stock,

          lowStockAt:
            item.lowStockAt,

          active:
            item.active,
        },
      );

      toast.success(
        `${item.name} updated`,
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save item",
      );
    }
  }

  /* =======================================================
     DELETE ITEM
  ======================================================= */

  async function deleteItem(
    item: CafeItem,
  ) {
    if (
      !window.confirm(
        `Delete ${item.name}?`,
      )
    ) {
      return;
    }

    try {
      await cafeApi.deleteItem(
        item._id,
      );

      toast.success(
        "Item deleted",
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete item",
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <PageHeader
        eyebrow="Cafe"
        title="Cafe POS & Orders"
        subtitle="Create counter orders, manage kitchen queue, stock and sales."
      />

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">

        <StatCard
          label="Sales Today"
          value={`Rs ${stats.salesToday.toLocaleString()}`}
        />

        <StatCard
          label="Orders Today"
          value={String(
            stats.totalOrdersToday,
          )}
        />

        <StatCard
          label="Items Sold"
          value={String(
            stats.itemsSoldToday,
          )}
        />

        <StatCard
          label="Open Orders"
          value={String(
            stats.openOrders,
          )}
        />

        <StatCard
          label="Avg Order"
          value={`Rs ${stats.averageOrderValue.toLocaleString()}`}
        />

        <StatCard
          label="Low Stock"
          value={String(
            stats.lowStockItems,
          )}
        />

      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="mb-5 flex flex-wrap gap-3">

        <Button
          variant="hero"
          onClick={() =>
            setOrderFormOpen(
              !orderFormOpen,
            )
          }
        >
          <ShoppingCart className="mr-2 size-4" />

          Create Order
        </Button>

        <Button
          variant="glass"
          onClick={() =>
            setItemFormOpen(
              !itemFormOpen,
            )
          }
        >
          <Plus className="mr-2 size-4" />

          Add Menu Item
        </Button>

      </div>

      {/* =================================================
          CREATE ORDER
      ================================================= */}

      {orderFormOpen && (

        <section className="glass-static mb-5 rounded-2xl p-5">

          <h2 className="font-display text-sm font-bold tracking-[0.15em] uppercase">
            New Cafe Order
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Station, customer and booking ID are optional.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            <Input
              value={
                station
              }
              onChange={(e) =>
                setStation(
                  e.target.value,
                )
              }
              placeholder="Station e.g. PC-04 (optional)"
            />

            <Input
              value={
                customerName
              }
              onChange={(e) =>
                setCustomerName(
                  e.target.value,
                )
              }
              placeholder="Customer name (optional)"
            />

            <Input
              value={
                bookingId
              }
              onChange={(e) =>
                setBookingId(
                  e.target.value,
                )
              }
              placeholder="Booking ID (optional)"
            />

          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">

            {activeItems.map(
              (item) => {

                const quantity =
                  quantities[
                    item._id
                  ] || 0;

                return (

                  <div
                    key={
                      item._id
                    }
                    className="rounded-xl border border-border p-3"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-medium">
                          {
                            item.name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Rs{" "}
                          {item.price.toLocaleString()}
                          {" · "}
                          {
                            item.stock
                          }{" "}
                          stock
                        </p>

                      </div>

                      <Input
                        type="number"
                        min={0}
                        max={
                          item.stock
                        }
                        value={
                          quantity
                        }
                        onChange={(e) => {

                          const value =
                            Math.max(
                              Math.min(
                                Number(
                                  e.target
                                    .value,
                                ) ||
                                  0,

                                item.stock,
                              ),

                              0,
                            );

                          setQuantities(
                            (
                              current,
                            ) => ({
                              ...current,

                              [item._id]:
                                value,
                            }),
                          );
                        }}
                        className="h-9 w-20"
                      />

                    </div>

                  </div>

                );
              },
            )}

          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            <Select
              value={
                paymentStatus
              }
              onValueChange={(
                value,
              ) =>
                setPaymentStatus(
                  value as
                    | "Unpaid"
                    | "Paid",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Paid">
                  Paid
                </SelectItem>

                <SelectItem value="Unpaid">
                  Unpaid
                </SelectItem>

              </SelectContent>
            </Select>

            <Select
              value={
                paymentMethod
              }
              onValueChange={
                setPaymentMethod
              }
              disabled={
                paymentStatus ===
                "Unpaid"
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Cash">
                  Cash
                </SelectItem>

                <SelectItem value="Easypaisa">
                  Easypaisa
                </SelectItem>

                <SelectItem value="JazzCash">
                  JazzCash
                </SelectItem>

              </SelectContent>
            </Select>

            <Input
              value={
                orderNotes
              }
              onChange={(e) =>
                setOrderNotes(
                  e.target.value,
                )
              }
              placeholder="Order notes (optional)"
            />

          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

            <div>

              <p className="text-xs text-muted-foreground">
                Order Total
              </p>

              <p className="font-display text-2xl font-black text-neon-cyan">
                Rs{" "}
                {orderTotal.toLocaleString()}
              </p>

            </div>

            <div className="flex gap-2">

              <Button
                variant="glass"
                onClick={() =>
                  setOrderFormOpen(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="hero"
                disabled={
                  creatingOrder ||
                  !selectedOrderItems.length
                }
                onClick={
                  createOrder
                }
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />

                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </Button>

            </div>

          </div>

        </section>

      )}

      {/* =================================================
          ADD ITEM
      ================================================= */}

      {itemFormOpen && (

        <section className="glass-static mb-5 rounded-2xl p-5">

          <h2 className="font-display text-sm font-bold uppercase">
            Add Cafe Item
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Input
              value={
                itemForm.name
              }
              onChange={(e) =>
                setItemForm({
                  ...itemForm,

                  name:
                    e.target.value,
                })
              }
              placeholder="Item name"
            />

            <Select
              value={
                itemForm.category
              }
              onValueChange={(
                value,
              ) =>
                setItemForm({
                  ...itemForm,

                  category:
                    value as CafeCategory,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                {categories.map(
                  (category) => (
                    <SelectItem
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </SelectItem>
                  ),
                )}

              </SelectContent>
            </Select>

            <Input
              type="number"
              value={
                itemForm.price
              }
              onChange={(e) =>
                setItemForm({
                  ...itemForm,

                  price:
                    Number(
                      e.target.value,
                    ),
                })
              }
              placeholder="Price"
            />

            <Input
              type="number"
              value={
                itemForm.stock
              }
              onChange={(e) =>
                setItemForm({
                  ...itemForm,

                  stock:
                    Number(
                      e.target.value,
                    ),
                })
              }
              placeholder="Stock"
            />

          </div>

          <div className="mt-4 flex gap-2">

            <Button
              variant="hero"
              onClick={
                createItem
              }
            >
              Save Item
            </Button>

            <Button
              variant="glass"
              onClick={() =>
                setItemFormOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

          </div>

        </section>

      )}

      {/* =================================================
          GRID
      ================================================= */}

      <div className="grid gap-5 xl:grid-cols-2">

        {/* ORDERS */}

        <div className="glass-static rounded-2xl p-4 sm:p-5">

          <h2 className="mb-4 font-display text-sm font-bold tracking-[0.14em] uppercase">
            Live Orders
          </h2>

          {loading ? (

            <div className="py-16 text-center">

              <Loader2 className="mx-auto size-5 animate-spin" />

            </div>

          ) : (

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    {[
                      "Order",
                      "Source",
                      "Station",
                      "Items",
                      "Total",
                      "Payment",
                      "Status",
                      "",
                    ].map(
                      (heading) => (
                        <TableHead
                          key={
                            heading
                          }
                          className="text-[10px] uppercase"
                        >
                          {
                            heading
                          }
                        </TableHead>
                      ),
                    )}

                  </TableRow>

                </TableHeader>

                <TableBody>

                  {orders.map(
                    (order) => (

                      <TableRow
                        key={
                          order._id
                        }
                      >

                        <TableCell className="font-display text-xs font-bold">
                          {
                            order.orderId
                          }
                        </TableCell>

                        <TableCell className="text-xs">
                          {
                            order.orderSource
                          }
                        </TableCell>

                        <TableCell className="text-xs">
                          {
                            order.station ||
                            "Counter"
                          }
                        </TableCell>

                        <TableCell className="max-w-56 text-xs text-muted-foreground">

                          {order.items
                            .map(
                              (
                                item,
                              ) =>
                                `${item.name} x${item.quantity}`,
                            )
                            .join(
                              ", ",
                            )}

                        </TableCell>

                        <TableCell>
                          Rs{" "}
                          {order.totalAmount.toLocaleString()}
                        </TableCell>

                        <TableCell>

                          <Badge
                            variant="outline"
                          >
                            {
                              order.paymentStatus
                            }
                          </Badge>

                        </TableCell>

                        <TableCell>

                          <Badge
                            variant="outline"
                            className={cn(
                              "border-transparent",

                              tone[
                                order.status
                              ],
                            )}
                          >
                            {
                              order.status
                            }
                          </Badge>

                        </TableCell>

                        <TableCell>

                          <div className="flex gap-1">

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                order.status ===
                                  "Served" ||
                                order.status ===
                                  "Cancelled"
                              }
                              onClick={() =>
                                advance(
                                  order,
                                )
                              }
                            >
                              Advance
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                order.status ===
                                  "Cancelled"
                              }
                              onClick={() =>
                                cancelOrder(
                                  order,
                                )
                              }
                            >
                              Cancel
                            </Button>

                          </div>

                        </TableCell>

                      </TableRow>

                    ),
                  )}

                </TableBody>

              </Table>

            </div>

          )}

        </div>

        {/* MENU */}

        <div className="glass-static rounded-2xl p-4 sm:p-5">

          <h2 className="mb-4 font-display text-sm font-bold tracking-[0.14em] uppercase">
            Menu & Stock
          </h2>

          <div className="grid gap-2">

            {items.map(
              (item) => (

                <div
                  key={
                    item._id
                  }
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                >

                  <div className="min-w-36 flex-1">

                    <p className="text-sm font-medium">
                      {
                        item.name
                      }
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      {
                        item.category
                      }
                    </p>

                  </div>

                  <div>

                    <p className="mb-1 text-[9px] uppercase text-muted-foreground">
                      Price
                    </p>

                    <Input
                      type="number"
                      value={
                        item.price
                      }
                      onChange={(e) =>
                        setItems(
                          (
                            current,
                          ) =>
                            current.map(
                              (
                                row,
                              ) =>
                                row._id ===
                                item._id
                                  ? {
                                      ...row,

                                      price:
                                        Number(
                                          e.target
                                            .value,
                                        ),
                                    }
                                  : row,
                            ),
                        )
                      }
                      className="h-9 w-24"
                    />

                  </div>

                  <div>

                    <p className="mb-1 text-[9px] uppercase text-muted-foreground">
                      Stock
                    </p>

                    <Input
                      type="number"
                      value={
                        item.stock
                      }
                      onChange={(e) =>
                        setItems(
                          (
                            current,
                          ) =>
                            current.map(
                              (
                                row,
                              ) =>
                                row._id ===
                                item._id
                                  ? {
                                      ...row,

                                      stock:
                                        Number(
                                          e.target
                                            .value,
                                        ),
                                    }
                                  : row,
                            ),
                        )
                      }
                      className="h-9 w-20"
                    />

                  </div>

                  <span
                    className={cn(
                      "w-20 text-right text-xs",

                      item.stock <=
                      item.lowStockAt
                        ? "text-neon-red"
                        : "text-muted-foreground",
                    )}
                  >
                    {
                      item.stock
                    }{" "}
                    left
                  </span>

                  <Switch
                    checked={
                      item.active
                    }
                    onCheckedChange={(
                      active,
                    ) =>
                      setItems(
                        (
                          current,
                        ) =>
                          current.map(
                            (
                              row,
                            ) =>
                              row._id ===
                              item._id
                                ? {
                                    ...row,

                                    active,
                                  }
                                : row,
                          ),
                      )
                    }
                  />

                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() =>
                      saveItem(
                        item,
                      )
                    }
                  >
                    Save
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      deleteItem(
                        item,
                      )
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>

                </div>

              ),
            )}

          </div>

        </div>

      </div>
    </>
  );
}