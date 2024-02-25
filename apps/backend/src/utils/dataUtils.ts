export const chunkData = <T>(data: T[], chunkSize: number): T[][] => {
    const result: T[][] = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
        result.push(data.slice(i, i + chunkSize));
    }
    
    return result;
};
