import dayjs from "dayjs";

export function getDate() {
    const dia = Number(dayjs().date()).toLocaleString("pt-br", { minimumIntegerDigits: 2 });
    const mes = Number(dayjs().month() + 1).toLocaleString("pt-br", { minimumIntegerDigits: 2 });
    return `${dia}/${mes}`;
}