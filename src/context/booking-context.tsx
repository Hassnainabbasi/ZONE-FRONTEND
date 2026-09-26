import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  bookingApi,
  type BookingConfig,
  type PriceData,
} from "@/services/bookingApi";

import {
  pricingApi,
  type PricingPlan,
} from "@/services/pricingApi";

/* =========================================================
   TYPES
========================================================= */

interface Customer {
  name:
    string;

  phone:
    string;

  email:
    string;
}

interface BookingContextType {
  date:
    string;

  setDate:
    (value: string) => void;

  startTime:
    string;

  setStartTime:
    (value: string) => void;

  hours:
    number;

  setHours:
    (value: number) => void;

  seats:
    number[];

  toggleSeat:
    (station: number) => void;

  clearSeats:
    () => void;

  payment:
    string;

  setPayment:
    (value: string) => void;

  systemType:
    string;

  setSystemType:
    (value: string) => void;

  selectedGameId:
    string;

  setSelectedGameId:
    (value: string) => void;

  customer:
    Customer;

  setCustomer:
    React.Dispatch<
      React.SetStateAction<Customer>
    >;

  selectedPricingPlan:
    PricingPlan | null;

  selectPricingPlan:
    (
      plan:
        PricingPlan | null,
    ) => void;

  clearPricingPlan:
    () => void;

  usePoints:
    boolean;

  setUsePoints:
    (value: boolean) => void;

  total:
    number;

  pricing:
    PriceData | null;

  config:
    BookingConfig | null;

  occupiedPCs:
    number[];

  configLoading:
    boolean;

  availabilityLoading:
    boolean;

  pricingLoading:
    boolean;

  refreshAvailability:
    () => Promise<void>;

  resetBooking:
    () => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const BookingContext =
  createContext<
    BookingContextType | undefined
  >(
    undefined,
  );

/* =========================================================
   PROVIDER
========================================================= */

export function BookingProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const [
    date,
    setDate,
  ] =
    useState("");

  const [
    startTime,
    setStartTime,
  ] =
    useState("");

  const [
    hours,
    setHours,
  ] =
    useState(
      1,
    );

  const [
    seats,
    setSeats,
  ] =
    useState<number[]>(
      [],
    );

  const [
    payment,
    setPayment,
  ] =
    useState("");

  const [
    systemType,
    setSystemType,
  ] =
    useState("");

  const [
    selectedGameId,
    setSelectedGameId,
  ] =
    useState("");

  const [
    customer,
    setCustomer,
  ] =
    useState<Customer>({
      name:
        "",

      phone:
        "",

      email:
        "",
    });

  const [
    selectedPricingPlan,
    setSelectedPricingPlan,
  ] =
    useState<
      PricingPlan | null
    >(
      null,
    );

  const [
    usePoints,
    setUsePoints,
  ] =
    useState(
      false,
    );

  const [
    config,
    setConfig,
  ] =
    useState<
      BookingConfig | null
    >(
      null,
    );

  const [
    occupiedPCs,
    setOccupiedPCs,
  ] =
    useState<number[]>(
      [],
    );

  const [
    pricing,
    setPricing,
  ] =
    useState<
      PriceData | null
    >(
      null,
    );

  const [
    configLoading,
    setConfigLoading,
  ] =
    useState(
      true,
    );

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] =
    useState(
      false,
    );

  const [
    pricingLoading,
    setPricingLoading,
  ] =
    useState(
      false,
    );

  /* =======================================================
     CONFIG
  ======================================================= */

  useEffect(() => {
    let mounted =
      true;

    async function loadConfig() {
      try {
        setConfigLoading(
          true,
        );

        const response =
          await bookingApi.getConfig();

        if (!mounted) {
          return;
        }

        const data =
          response.data;

        setConfig(
          data,
        );

        setSystemType(
          data.systems[0]
            ?.name ||
            "",
        );

        setHours(
          data.durations[0] ||
            1,
        );

        setStartTime(
          data.openingTime,
        );

        setPayment(
          data.paymentMethods[0] ||
            "",
        );
      } catch (
        error
      ) {
        console.error(
          "Booking config:",
          error,
        );
      } finally {
        if (mounted) {
          setConfigLoading(
            false,
          );
        }
      }
    }

    void loadConfig();

    return () => {
      mounted =
        false;
    };
  }, []);

  /* =======================================================
     SELECT PACKAGE
  ======================================================= */

  function selectPricingPlan(
    plan:
      PricingPlan | null,
  ) {
    setSelectedPricingPlan(
      plan,
    );

    setSeats(
      [],
    );

    setOccupiedPCs(
      [],
    );

    setPricing(
      null,
    );

    if (!plan) {
      sessionStorage.removeItem(
        "selectedPricingPlan",
      );

      return;
    }

    sessionStorage.setItem(
      "selectedPricingPlan",

      plan._id,
    );

    if (
      plan.systemType !==
      "Other"
    ) {
      setSystemType(
        plan.systemType,
      );
    }

    if (
      plan.startTime
    ) {
      setStartTime(
        plan.startTime,
      );
    }

    if (
      Number(
        plan.durationHours,
      ) >
      0
    ) {
      setHours(
        Number(
          plan.durationHours,
        ),
      );
    }
  }

  function clearPricingPlan() {
    setSelectedPricingPlan(
      null,
    );

    setPricing(
      null,
    );

    setSeats(
      [],
    );

    sessionStorage.removeItem(
      "selectedPricingPlan",
    );

    if (config) {
      setStartTime(
        config.openingTime,
      );

      setHours(
        config.durations[0] ||
          1,
      );
    }
  }

  /* =======================================================
     RESTORE PACKAGE AFTER PAGE RENDER
  ======================================================= */

  useEffect(() => {
    const id =
      sessionStorage.getItem(
        "selectedPricingPlan",
      );

    if (!id) {
      return;
    }

    let mounted =
      true;

    async function restore() {
      try {
        const response =
          await pricingApi.publicList();

        if (!mounted) {
          return;
        }

        const plan =
          response.data.find(
            (
              item,
            ) =>
              item._id ===
              id,
          );

        if (plan) {
          selectPricingPlan(
            plan,
          );
        } else {
          sessionStorage.removeItem(
            "selectedPricingPlan",
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Restore package:",
          error,
        );
      }
    }

    void restore();

    return () => {
      mounted =
        false;
    };
  }, []);

  /* =======================================================
     SYSTEM CHANGE
  ======================================================= */

  useEffect(() => {
    setSeats(
      [],
    );

    setOccupiedPCs(
      [],
    );

    if (
      selectedPricingPlan &&
      selectedPricingPlan.systemType !==
        "Other" &&
      selectedPricingPlan.systemType !==
        systemType
    ) {
      setSelectedPricingPlan(
        null,
      );

      sessionStorage.removeItem(
        "selectedPricingPlan",
      );
    }
  }, [
    systemType,
  ]);

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  const refreshAvailability =
    useCallback(
      async () => {
        if (
          !date ||
          !systemType
        ) {
          setOccupiedPCs(
            [],
          );

          return;
        }

        if (
          !startTime ||
          !hours
        ) {
          setOccupiedPCs(
            [],
          );

          return;
        }

        try {
          setAvailabilityLoading(
            true,
          );

          const response =
            await bookingApi.getAvailability({
              date,

              startTime,

              hours,

              systemType,

              pricingPlanId:
                selectedPricingPlan
                  ?._id ||
                null,
            });

          setOccupiedPCs(
            response.data
              .occupiedStations,
          );

          setSeats(
            (
              current,
            ) =>
              current.filter(
                (
                  station,
                ) =>
                  !response.data
                    .occupiedStations
                    .includes(
                      station,
                    ),
              ),
          );
        } catch (
          error
        ) {
          console.error(
            "Availability:",
            error,
          );
        } finally {
          setAvailabilityLoading(
            false,
          );
        }
      },

      [
        date,
        startTime,
        hours,
        systemType,
        selectedPricingPlan
          ?._id,
      ],
    );

  useEffect(() => {
    void refreshAvailability();
  }, [
    refreshAvailability,
  ]);

  /* =======================================================
     PRICING
  ======================================================= */

  useEffect(() => {
    let mounted =
      true;

    if (
      !seats.length ||
      !systemType
    ) {
      setPricing(
        null,
      );

      return;
    }

    async function calculate() {
      try {
        setPricingLoading(
          true,
        );

        const response =
          await bookingApi.calculate({
            hours,

            stations:
              seats,

            systemType,

            gameId:
              selectedGameId ||
              null,

            pricingPlanId:
              selectedPricingPlan
                ?._id ||
              null,

            usePoints,
          });

        if (!mounted) {
          return;
        }

        setPricing(
          response.data,
        );

        /*
         * Backend confirms package timing.
         */

        if (
          selectedPricingPlan
        ) {
          if (
            response.data.hours
          ) {
            setHours(
              response.data.hours,
            );
          }

          if (
            response.data
              .packageStartTime
          ) {
            setStartTime(
              response.data
                .packageStartTime,
            );
          }
        }
      } catch (
        error
      ) {
        console.error(
          "Calculate price:",
          error,
        );

        if (mounted) {
          setPricing(
            null,
          );
        }
      } finally {
        if (mounted) {
          setPricingLoading(
            false,
          );
        }
      }
    }

    void calculate();

    return () => {
      mounted =
        false;
    };
  }, [
    hours,
    seats,
    systemType,
    selectedGameId,
    selectedPricingPlan
      ?._id,
    usePoints,
  ]);

  /* =======================================================
     SEAT
  ======================================================= */

  function toggleSeat(
    station:
      number,
  ) {
    if (
      occupiedPCs.includes(
        station,
      )
    ) {
      return;
    }

    setSeats(
      (
        current,
      ) =>
        current.includes(
          station,
        )
          ? current.filter(
              (
                value,
              ) =>
                value !==
                station,
            )
          : [
              ...current,

              station,
            ],
    );
  }

  function clearSeats() {
    setSeats(
      [],
    );
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetBooking() {
    setDate("");

    setSeats([]);

    setOccupiedPCs([]);

    setPricing(
      null,
    );

    setUsePoints(
      false,
    );

    setSelectedPricingPlan(
      null,
    );

    sessionStorage.removeItem(
      "selectedPricingPlan",
    );

    if (!config) {
      return;
    }

    setHours(
      config.durations[0] ||
        1,
    );

    setStartTime(
      config.openingTime,
    );

    setPayment(
      config.paymentMethods[0] ||
        "",
    );

    setSystemType(
      config.systems[0]
        ?.name ||
        "",
    );
  }

  const total =
    pricing?.totalAmount ||
    0;

  const value =
    useMemo(
      () => ({
        date,
        setDate,

        startTime,
        setStartTime,

        hours,
        setHours,

        seats,
        toggleSeat,
        clearSeats,

        payment,
        setPayment,

        systemType,
        setSystemType,

        selectedGameId,
        setSelectedGameId,

        customer,
        setCustomer,

        selectedPricingPlan,
        selectPricingPlan,
        clearPricingPlan,

        usePoints,
        setUsePoints,

        total,

        pricing,

        config,

        occupiedPCs,

        configLoading,

        availabilityLoading,

        pricingLoading,

        refreshAvailability,

        resetBooking,
      }),

      [
        date,
        startTime,
        hours,
        seats,
        payment,
        systemType,
        selectedGameId,
        customer,
        selectedPricingPlan,
        usePoints,
        total,
        pricing,
        config,
        occupiedPCs,
        configLoading,
        availabilityLoading,
        pricingLoading,
        refreshAvailability,
      ],
    );

  return (
    <BookingContext.Provider
      value={
        value
      }
    >
      {
        children
      }
    </BookingContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useBooking() {
  const context =
    useContext(
      BookingContext,
    );

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider",
    );
  }

  return context;
}