import {
  useEffect,
  useState,
} from "react";

import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  toast,
} from "sonner";

import {
  Edit,
  Loader2,
  Plus,
  Search,
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
  PageHeader,
} from "@/components/admin/AdminShell";

import {
  gameApi,
  type Game,
  type GameCategory,
  type GamePlatform,
} from "@/services/gameApi";

export const Route =
  createFileRoute(
    "/admin/games",
  )({
    component:
      GamesPage,
  });

const categories: GameCategory[] = [
  "FPS",
  "Racing",
  "Sports",
  "Fighting",
  "Action",
  "Adventure",
  "Battle Royale",
  "Strategy",
  "Other",
];

const platforms: GamePlatform[] = [
  "PC",
  "PS5",
  "Both",
];

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  title: "",

  category:
    "FPS" as GameCategory,

  genre: "",

  platform:
    "PC" as GamePlatform,

  rate: 0,

  poster: "",

  players:
    "1 Player",

  description: "",

  active: true,

  featured: false,

  sortOrder: 0,
};

/* =========================================================
   PAGE
========================================================= */

function GamesPage() {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

  const [
    platformFilter,
    setPlatformFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    games,
    setGames,
  ] =
    useState<Game[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingGame,
    setEditingGame,
  ] =
    useState<Game | null>(
      null,
    );

  const [
    form,
    setForm,
  ] = useState(
    emptyForm,
  );

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedQuery(
            query.trim(),
          );
        },
        350,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [query]);

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadGames() {
    try {
      setLoading(true);

      const response =
        await gameApi.list({
          search:
            debouncedQuery,

          platform:
            platformFilter,

          category:
            categoryFilter,

          limit: 200,
        });

      setGames(
        response.data,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load games",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, [
    debouncedQuery,
    platformFilter,
    categoryFilter,
  ]);

  /* =======================================================
     OPEN ADD
  ======================================================= */

  function openAddForm() {
    setEditingGame(
      null,
    );

    setForm(
      emptyForm,
    );

    setFormOpen(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function openEditForm(
    game: Game,
  ) {
    setEditingGame(
      game,
    );

    setForm({
      title:
        game.title,

      category:
        game.category,

      genre:
        game.genre || "",

      platform:
        game.platform,

      rate:
        game.rate,

      poster:
        game.poster || "",

      players:
        game.players ||
        "1 Player",

      description:
        game.description ||
        "",

      active:
        game.active,

      featured:
        game.featured,

      sortOrder:
        game.sortOrder ||
        0,
    });

    setFormOpen(true);
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSave() {
    if (
      !form.title.trim()
    ) {
      toast.error(
        "Game title is required",
      );

      return;
    }

    try {
      setSaving(true);

      if (editingGame) {
        await gameApi.update(
          editingGame._id,
          form,
        );

        toast.success(
          "Game updated successfully",
        );
      } else {
        await gameApi.create(
          form,
        );

        toast.success(
          "Game added successfully",
        );
      }

      setFormOpen(false);

      setEditingGame(
        null,
      );

      setForm(
        emptyForm,
      );

      await loadGames();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save game",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     STATUS
  ======================================================= */

  async function changeStatus(
    game: Game,
    active: boolean,
  ) {
    /*
     * Optimistic local update.
     */

    setGames(
      (current) =>
        current.map(
          (item) =>
            item._id ===
            game._id
              ? {
                  ...item,
                  active,
                }
              : item,
        ),
    );

    try {
      await gameApi.toggleStatus(
        game._id,
        active,
      );

      toast.success(
        active
          ? `${game.title} activated`
          : `${game.title} disabled`,
      );
    } catch (error) {
      /*
       * Restore server state.
       */

      await loadGames();

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update game",
      );
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(
    game: Game,
  ) {
    if (
      !window.confirm(
        `Delete "${game.title}"?`,
      )
    ) {
      return;
    }

    try {
      await gameApi.delete(
        game._id,
      );

      toast.success(
        `${game.title} deleted`,
      );

      await loadGames();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete game",
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Game Library & Pricing"
        subtitle="Manage installed games, platform availability and hourly rates."
        action={
          <Button
            variant="hero"
            size="sm"
            onClick={
              openAddForm
            }
          >
            <Plus className="mr-2 size-4" />

            Add Title
          </Button>
        }
      />

      {/* ===================================================
          ADD / EDIT FORM
      =================================================== */}

      {formOpen && (
        <section className="glass-static mb-5 rounded-2xl p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <p className="font-display text-sm font-bold">
                {editingGame
                  ? "Edit Game"
                  : "Add Game"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Game will automatically appear in the public library when active.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFormOpen(
                  false,
                )
              }
            >
              Close
            </Button>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* TITLE */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Title
              </p>

              <Input
                value={
                  form.title
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      title:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="Valorant"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Category
              </p>

              <Select
                value={
                  form.category
                }
                onValueChange={(
                  value,
                ) =>
                  setForm(
                    (current) => ({
                      ...current,

                      category:
                        value as GameCategory,
                    }),
                  )
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

            </div>

            {/* GENRE */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Genre
              </p>

              <Input
                value={
                  form.genre
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      genre:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="Tactical Shooter"
              />

            </div>

            {/* PLATFORM */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Platform
              </p>

              <Select
                value={
                  form.platform
                }
                onValueChange={(
                  value,
                ) =>
                  setForm(
                    (current) => ({
                      ...current,

                      platform:
                        value as GamePlatform,
                    }),
                  )
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  {platforms.map(
                    (platform) => (
                      <SelectItem
                        key={
                          platform
                        }
                        value={
                          platform
                        }
                      >
                        {platform ===
                        "PS5"
                          ? "PlayStation 5"
                          : platform}
                      </SelectItem>
                    ),
                  )}

                </SelectContent>

              </Select>

            </div>

            {/* RATE */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Rate / Hour
              </p>

              <Input
                type="number"
                min="0"
                value={
                  form.rate
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      rate:
                        Number(
                          e.target
                            .value,
                        ),
                    }),
                  )
                }
                placeholder="500"
              />

            </div>

            {/* PLAYERS */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Players
              </p>

              <Input
                value={
                  form.players
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      players:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="1–5 Players"
              />

            </div>

            {/* POSTER */}

            <div className="sm:col-span-2">

              <p className="mb-2 text-xs text-muted-foreground">
                Poster URL
              </p>

              <Input
                value={
                  form.poster
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      poster:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="https://..."
              />

            </div>

            {/* SORT */}

            <div>

              <p className="mb-2 text-xs text-muted-foreground">
                Sort Order
              </p>

              <Input
                type="number"
                value={
                  form.sortOrder
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      sortOrder:
                        Number(
                          e.target
                            .value,
                        ),
                    }),
                  )
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div className="sm:col-span-2 lg:col-span-3">

              <p className="mb-2 text-xs text-muted-foreground">
                Description
              </p>

              <Input
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm(
                    (current) => ({
                      ...current,

                      description:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="Short description"
              />

            </div>

          </div>

          {/* SWITCHES */}

          <div className="mt-5 flex flex-wrap gap-6">

            <label className="flex items-center gap-3 text-sm">

              <Switch
                checked={
                  form.active
                }
                onCheckedChange={(
                  active,
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      active,
                    }),
                  )
                }
              />

              Active

            </label>

            <label className="flex items-center gap-3 text-sm">

              <Switch
                checked={
                  form.featured
                }
                onCheckedChange={(
                  featured,
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      featured,
                    }),
                  )
                }
              />

              Featured

            </label>

          </div>

          <div className="mt-6 flex gap-2">

            <Button
              variant="hero"
              disabled={
                saving
              }
              onClick={
                handleSave
              }
            >

              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : editingGame ? (
                "Update Game"
              ) : (
                "Add Game"
              )}

            </Button>

            <Button
              variant="glass"
              onClick={() =>
                setFormOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

          </div>

        </section>
      )}

      {/* ===================================================
          CATALOGUE
      =================================================== */}

      <section className="glass-static rounded-2xl p-5">

        {/* FILTERS */}

        <div className="mb-5 grid gap-2 sm:grid-cols-3">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={
                query
              }
              onChange={(event) =>
                setQuery(
                  event.target
                    .value,
                )
              }
              placeholder="Search titles"
              className="pl-9"
            />

          </div>

          <Select
            value={
              platformFilter
            }
            onValueChange={
              setPlatformFilter
            }
          >

            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All Platforms
              </SelectItem>

              <SelectItem value="PC">
                PC
              </SelectItem>

              <SelectItem value="PS5">
                PlayStation 5
              </SelectItem>

            </SelectContent>

          </Select>

          <Select
            value={
              categoryFilter
            }
            onValueChange={
              setCategoryFilter
            }
          >

            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All Categories
              </SelectItem>

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

        </div>

        {/* ROWS */}

        {loading ? (
          <div className="flex justify-center py-16">

            <Loader2 className="size-6 animate-spin text-neon-cyan" />

          </div>
        ) : (
          <div className="grid gap-2">

            {games.map(
              (game) => (

                <div
                  key={
                    game._id
                  }
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                >

                  {/* POSTER */}

                  {game.poster ? (

                    <img
                      src={
                        game.poster
                      }
                      alt={
                        game.title
                      }
                      className="h-14 w-10 rounded-md object-cover"
                    />

                  ) : (

                    <div className="h-14 w-10 rounded-md bg-surface-2" />

                  )}

                  {/* TITLE */}

                  <div className="min-w-40 flex-1">

                    <p className="font-medium">
                      {
                        game.title
                      }
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {
                        game.players
                      }
                    </p>

                  </div>

                  <Badge variant="outline">
                    {
                      game.category
                    }
                  </Badge>

                  <span className="w-24 text-sm text-muted-foreground">
                    {
                      game.platform
                    }
                  </span>

                  <span className="w-24 text-sm">
                    {game.rate >
                    0
                      ? `Rs ${game.rate}/hr`
                      : "Platform Rate"}
                  </span>

                  {/* ACTIVE */}

                  <div className="flex items-center gap-2">

                    <Switch
                      checked={
                        game.active
                      }
                      onCheckedChange={(
                        active,
                      ) =>
                        changeStatus(
                          game,
                          active,
                        )
                      }
                    />

                    <span className="w-12 text-[10px] text-muted-foreground">
                      {game.active
                        ? "Active"
                        : "Off"}
                    </span>

                  </div>

                  {/* EDIT */}

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit game"
                    onClick={() =>
                      openEditForm(
                        game,
                      )
                    }
                  >
                    <Edit className="size-4" />
                  </Button>

                  {/* DELETE */}

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete game"
                    onClick={() =>
                      handleDelete(
                        game,
                      )
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>

                </div>

              ),
            )}

            {!games.length && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No games found.
              </div>
            )}

          </div>
        )}

      </section>
    </>
  );
}