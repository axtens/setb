declare function print(message: string): void;
declare function exit(arg0: number): void;
declare namespace __ {
    const argc: number;
    function args(index: number): string;
}
declare function slurp(filename: string): string;
