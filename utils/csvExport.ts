import { AnalysisItem } from "../types";

export const generateCSV = (items: AnalysisItem[]): string => {
    const completedItems = items.filter(i => i.status === 'success' && i.data);

    if (completedItems.length === 0) return '';

    // Shutterstock formatted CSV headers
    const headers = ['Filename', 'Description', 'Keywords', 'Categories'];

    const rows = completedItems.map(item => {
        // Escape quotes in description to prevent CSV breaking
        const description = `"${(item.data?.description || '').replace(/"/g, '""')}"`;

        // Keywords should be comma separated, usually enclosed in quotes if they contain commas (they shouldn't, but safe side)
        const keywords = `"${(item.data?.keywords || []).join(',')}"`;

        // Categories are optional, we leave blank for now or could auto-guess in future
        const categories = "";

        return [
            item.file.name,
            description,
            keywords,
            categories
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string = 'shutterstock_metadata.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
