import { createEffect, createSignal } from "solid-js";
import PocketBase from "pocketbase";

interface Props {
  searchParams: { [index: string]: string };
  games: { title: string; id: string }[];
}

type reportType =
  | "none"
  | "game proposal"
  | "game error"
  | "addon proposal"
  | "addon error";

async function getAddons(gameId: string) {
  try {
    const pb = new PocketBase("http://127.0.0.1:8090");
    const res = await pb
      .collection("addon")
      .getList(1, 200, { filter: `game_id = "${gameId}"` });
    const addons = res.items.map((addon) => ({
      title: addon.title,
      id: addon.id,
    }));
    return addons;
  } catch (error) {
    return [];
  }
}

export default function multiForm({ searchParams, games }: Props) {
  const [formPage, setFormPage] = createSignal<0 | 1>(0);
  const [type, setType] = createSignal<reportType>("none");
  const [game, setGame] = createSignal<string>("none");
  const [addon, setAddon] = createSignal<string>("none");
  const [addons, setAddons] = createSignal<{ id: string; title: string }[]>([]);
  const [formStatus, setFormStatus] = createSignal<
    null | "loading" | "success" | "error"
  >(null);

  createEffect(async () => {
    setType(searchParams.t as reportType);
    setGame(searchParams.game || "none");
    setAddon(searchParams.addon || "none");

    if (searchParams.game) {
      setAddons(await getAddons(searchParams.game));
    }
  });

  createEffect(async () => {
    if (game() === "none") setAddons([]);
    const updatedAddons = await getAddons(game());
    setAddons(updatedAddons);
  }, game);

  const sendReport = async (event: Event) => {
    event.preventDefault();

    setFormStatus("loading");
    const pb = new PocketBase("http://127.0.0.1:8090");
    const form = event.target as HTMLFormElement;
    const type = (form.querySelector("#type") as HTMLSelectElement).value;
    const game = (form.querySelector("#game") as HTMLSelectElement).value;
    const addon = (form.querySelector("#addon") as HTMLSelectElement).value;
    const description = (
      form.querySelector("#description") as HTMLTextAreaElement
    ).value;
    const title = (form.querySelector("#title") as HTMLInputElement).value;
    const website = (form.querySelector("#website") as HTMLInputElement).value;
    const download = (form.querySelector("#download") as HTMLInputElement)
      .value;

    let reportData: {} = {
      type,
      owner_id: pb.authStore.model?.id,
      description,
    };

    switch (type) {
      case "game proposal":
        reportData = {
          ...reportData,
          title,
          website,
        };
        break;
      case "addon proposal":
        reportData = {
          ...reportData,
          game_id: game,
          title,
          website,
          download,
        };
        break;
      case "game error":
        reportData = {
          ...reportData,
          game_id: game,
        };
        break;
      case "addon error":
        reportData = {
          ...reportData,
          game_id: game,
          addon_id: addon,
        };
        break;
      default:
        break;
    }

    try {
      await pb.collection("report").create(reportData);
      setFormStatus("success");
    } catch (error) {
      setFormStatus("error");
      console.log(error);
    }

    setTimeout(() => setFormStatus(null), 3000);
  };

  return (
    <>
      {formStatus() &&
        (formStatus() === "success" ? (
          <div class="bg-success absolute text-base-100 top-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm">
            success
          </div>
        ) : formStatus() === "loading" ? (
          <div class="bg-info absolute top-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm">
            loading...
          </div>
        ) : (
          <div class="bg-error absolute top-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm">
            something went wrong
          </div>
        ))}
      <form onSubmit={sendReport}>
        <section
          style={{ display: formPage() === 0 ? "flex" : "none" }}
          class="flex-col gap-4"
        >
          <div class="flex flex-col">
            <label for="type">type:</label>
            <select
              name="type"
              id="type"
              value={type()}
              onChange={(e) => setType(e.target.value as reportType)}
              class="select select-accent bg-accent"
            >
              <option
                disabled
                value="none"
              >
                choose a report type
              </option>
              <option value="game proposal">game proposal</option>
              <option value="game error">game error</option>
              <option value="addon proposal">addon proposal</option>
              <option value="addon error">addon error</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="game">game:</label>
            <select
              name="game"
              id="game"
              disabled={type() === "game proposal"}
              onChange={(e) => setGame(e.target.value)}
              value={game()}
              class="select bg-accent"
            >
              <option
                value="none"
                disabled
              >
                select game
              </option>
              {games.map((game) => (
                <option value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="addon">addon:</label>
            <select
              name="addon"
              id="addon"
              class="select bg-accent"
              value={addon()}
              onChange={(e) => setAddon(e.target.value)}
              disabled={type() !== "addon error"}
            >
              <option
                value="none"
                disabled
              >
                select addon
              </option>
              {addons().map((addon) => (
                <option value={addon.id}>{addon.title}</option>
              ))}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="description">description:</label>
            <textarea
              name="description"
              id="description"
              rows="10"
              class="textarea bg-accent resize-none"
            />
          </div>
          <button
            type="button"
            onClick={setFormPage.bind(null, 1)}
            class="btn btn-secondary btn-md self-end"
          >
            next &rarr;
          </button>
        </section>
        <section
          style={{ display: formPage() === 1 ? "flex" : "none" }}
          class="flex-col gap-4"
        >
          <div class="flex flex-col">
            <label for="title">title:</label>
            <input
              id="title"
              placeholder="game or addon title..."
              type="text"
              disabled={type() === "addon error" || type() === "game error"}
              class="input bg-accent"
            />
          </div>
          <div class="flex flex-col">
            <label for="website">website link:</label>
            <input
              type="text"
              id="website"
              placeholder="link..."
              disabled={type() === "addon error" || type() === "game error"}
              class="input bg-accent"
            />
          </div>
          <div class="flex flex-col">
            <label for="download">download link:</label>
            <input
              type="text"
              id="download"
              placeholder="link..."
              disabled={type() !== "addon proposal"}
              class="input bg-accent"
            />
          </div>
          <p class="font-bold">
            Po wysłaniu zgłoszenia dostaniesz odpowiedź na maila który jest
            powiązany z twoim kontem.
          </p>
          <p class="font-bold">
            Uwaga!
            <br />
            Jeżeli twoje zgłoszenie nie będzie miało żadnego sęsu możliwość
            wysyłania zgłoszeń zostanie ci odebrana.
          </p>
          <div class="flex justify-between">
            <button
              type="button"
              onClick={setFormPage.bind(null, 0)}
              class="btn btn-md btn-secondary w-24"
            >
              &larr; prev
            </button>
            <button class="btn btn-md btn-secondary w-24">send</button>
          </div>
        </section>
      </form>
    </>
  );
}
