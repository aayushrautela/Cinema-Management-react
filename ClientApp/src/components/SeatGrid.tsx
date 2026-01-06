import type { SeatStatus } from '../types';

interface SeatGridProps {
    rows: number;
    seatsPerRow: number;
    seats: SeatStatus[];
    onSeatClick: (row: number, seat: number) => void;
    disabled?: boolean;
}

export default function SeatGrid({ rows, seatsPerRow, seats, onSeatClick, disabled }: SeatGridProps) {
    const getSeatStatus = (row: number, seat: number): SeatStatus | undefined => {
        return seats.find((s) => s.row === row && s.seat === seat);
    };

    const getRowLetter = (rowNumber: number): string => {
        return String.fromCharCode('A'.charCodeAt(0) + rowNumber - 1);
    };

    const getSeatClass = (seatStatus: SeatStatus | undefined): string => {
        if (!seatStatus) return 'btn-secondary';
        if (seatStatus.isOwnedByCurrentUser) return 'btn-warning';
        if (seatStatus.isReserved) return 'btn-danger';
        return 'btn-success';
    };

    const getSeatTitle = (seatStatus: SeatStatus | undefined, rowLetter: string, seatNum: number): string => {
        if (!seatStatus) return 'Unknown';
        if (seatStatus.isOwnedByCurrentUser) return `Your reservation ${rowLetter}${seatNum} - Click to cancel`;
        if (seatStatus.isReserved) return `Reserved ${rowLetter}${seatNum}`;
        return `Available ${rowLetter}${seatNum} - Click to reserve`;
    };

    return (
        <div className="seat-grid">
            {/* Screen */}
            <div className="mb-4">
                <div className="bg-dark text-white text-center p-3 rounded">
                    <strong>SCREEN</strong>
                </div>
            </div>

            {/* Seat Map - Centered */}
            <div className="d-flex justify-content-center">
                <div className="seat-map-wrapper">
                    {/* Column Headers */}
                    <div className="d-flex mb-2">
                        <div style={{ width: '40px' }}></div>
                        <div className="d-flex">
                            {Array.from({ length: seatsPerRow }, (_, i) => (
                                <div
                                    key={i + 1}
                                    className="text-center text-muted small"
                                    style={{ width: '38px' }}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seat Rows */}
                    {Array.from({ length: rows }, (_, rowIndex) => {
                        const rowNumber = rowIndex + 1;
                        const rowLetter = getRowLetter(rowNumber);

                        return (
                            <div key={rowNumber} className="d-flex mb-1 align-items-center">
                                {/* Row Label */}
                                <div
                                    className="text-center fw-bold"
                                    style={{ width: '40px' }}
                                >
                                    {rowLetter}
                                </div>

                                {/* Seats */}
                                <div className="d-flex">
                                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                                        const seatNumber = seatIndex + 1;
                                        const seatStatus = getSeatStatus(rowNumber, seatNumber);
                                        const isClickable =
                                            !disabled &&
                                            seatStatus &&
                                            (!seatStatus.isReserved || seatStatus.isOwnedByCurrentUser);

                                        return (
                                            <div key={seatNumber} style={{ padding: '1px' }}>
                                                <button
                                                    className={`btn btn-sm ${getSeatClass(seatStatus)}`}
                                                    style={{
                                                        width: '36px',
                                                        height: '32px',
                                                        fontSize: '0.7rem',
                                                        padding: '2px',
                                                    }}
                                                    title={getSeatTitle(seatStatus, rowLetter, seatNumber)}
                                                    onClick={() => isClickable && onSeatClick(rowNumber, seatNumber)}
                                                    disabled={!isClickable}
                                                >
                                                    {rowLetter}{seatNumber}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 text-center">
                <h5>Legend:</h5>
                <button type="button" className="btn btn-success btn-sm me-2" disabled>Available</button>
                <button type="button" className="btn btn-danger btn-sm me-2" disabled>Reserved</button>
                <button type="button" className="btn btn-warning btn-sm" disabled>Your Reservation</button>
            </div>
        </div>
    );
}
