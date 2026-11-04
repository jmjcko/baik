import { fireEvent, screen } from '@testing-library/react';

/** Opens one task of the row under the check (the chain, the wheels and tyres, the trainer, the troubleshooter or the wash). */
export const openCare = (item: 'chain' | 'wheels' | 'trainer' | 'fix' | 'wash') => fireEvent.click(screen.getByTestId(`task-${item}`));

/** Goes to a step of the check by its place in the list: the five nodes of the bike (1 to 5), then the front and the rear tyre (6 and 7). */
export const pickStep = (number: number) => fireEvent.click(screen.getAllByTestId(/^check-step-/)[number - 1]);
