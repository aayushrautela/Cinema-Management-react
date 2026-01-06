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

    const getSeatClass = (seatStatus: SeatStatus | undefined): string => {
        if (!seatStatus) return 'btn-outline-secondary';
        if (seatStatus.isOwnedByCurrentUser) return 'btn-success';
        if (seatStatus.isReserved) return 'btn-danger';
        return 'btn-outline-primary';
    };

    const getSeatTitle = (seatStatus: SeatStatus | undefined): string => {
        if (!seatStatus) return 'Unknown';
        if (seatStatus.isOwnedByCurrentUser) return 'Your reservation (click to cancel)';
        if (seatStatus.isReserved) return 'Reserved by another user';
        return 'Available (click to reserve)';
    };

    return (
        <div className="seat-grid">
            {/* Screen indicator */}
            <div className="text-center mb-4">
                <div
                    className="bg-secondary text-white py-2 px-5 rounded mx-auto"
                    style={{ maxWidth: '60%' }}
                >
                    📽️ SCREEN
                </div>
            </div>

            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 mb-4 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-primary btn-sm" disabled style={{ width: '30px', height: '30px' }}></button>
                    <span>Available</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-success btn-sm" disabled style={{ width: '30px', height: '30px' }}></button>
                    <span>Your Seat</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-danger btn-sm" disabled style={{ width: '30px', height: '30px' }}></button>
                    <span>Taken</span>
                </div>
            </div>

            {/* Seat grid */}
            <div className="d-flex flex-column align-items-center gap-2">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex + 1} className="d-flex align-items-center gap-2">
                        <span className="badge bg-secondary" style={{ width: '40px' }}>
                            Row {rowIndex + 1}
                        </span>
                        <div className="d-flex gap-1 flex-wrap">
                            {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                                const seatStatus = getSeatStatus(rowIndex + 1, seatIndex + 1);
                                const isClickable =
                                    !disabled &&
                                    seatStatus &&
                                    (!seatStatus.isReserved || seatStatus.isOwnedByCurrentUser);

                                return (
                                    <button
                                        key={seatIndex + 1}
                                        className={`btn btn-sm ${getSeatClass(seatStatus)}`}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            fontSize: '0.75rem',
                                            cursor: isClickable ? 'pointer' : 'not-allowed',
                                        }}
                                        title={getSeatTitle(seatStatus)}
                                        onClick={() => isClickable && onSeatClick(rowIndex + 1, seatIndex + 1)}
                                        disabled={!isClickable}
                                    >
                                        {seatIndex + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
