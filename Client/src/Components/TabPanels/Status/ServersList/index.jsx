import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Server from "./Server";
import update from "immutability-helper";

/**
 * 
 * @param {*} monitors The server monitors options
 * @param {*} cards A set of servers/monitors user can add/remove/drag/drop to be displayed in status page
 * each card can be autocompleted/selected from the existing monitors list
 * @param {*} setCards Function to set the cards
 * @param {*} form The Status page form
 * @param {*} setForm Function to set the form
 * @param {*} removeItem The function used to remove a single server
 * @returns A list of user selected Servers/Monitors
 */


const ServersList = ({ monitors, cards, setCards, form, setForm, removeItem }) => {
	const grid = 8;

	const handleCardChange = (event, val) => {
		let newCards;
		const { id } = event.target;
		let idx = cards.findIndex((a) => {
			let found = false;
			let optionIdx = id.indexOf("-option");
			if (optionIdx !== -1) found = a.id == id.substr(0, optionIdx);
			else found = a.id == id;
			return found;
		});

		if (idx >= 0) {
			let x = JSON.parse(JSON.stringify(cards[idx]));
			x.val = val;
			newCards = update(cards, { $splice: [[idx, 1, x]] });
		} else {
			newCards = update(cards, { $push: [{ id: id, val: val }] });
		}
		setCards(newCards);
		setForm({ ...form, monitors: newCards.map((c) => c.val) });
	};

	const moveCard = (dragIndex, hoverIndex) => {
		const dragCard = cards[dragIndex];
		const newCards = update(cards, {
			$splice: [
				[dragIndex, 1],
				[hoverIndex, 0, dragCard],
			],
		});
		setCards(newCards);
		setForm({ ...form, monitors: newCards.map((c) => c.val) });
	};

	const handleDragEnd = (result) => {
		// dropped outside the list
		if (!result.destination) {
			return;
		}
		moveCard(result.source.index, result.destination.index);
	};

	const getItemStyle = (isDragging, draggableStyle) => ({
		// some basic styles to make the items look a bit nicer
		userSelect: "none",
		padding: grid * 2,
		margin: `0 0 ${grid}px 0`,

		// change background colour if dragging
		background: isDragging ? "lightgreen" : "lightgrey",

		// styles we need to apply on draggables
		...draggableStyle,
	});

	const getListStyle = (isDraggingOver) => ({
		background: isDraggingOver ? "lightblue" : "white",
		padding: grid,
		width: 550,
	});

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="droppable">
				{(provided, snapshot) => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
						style={getListStyle(snapshot.isDraggingOver)}
					>
						{cards.map((item, index) => (
							<Draggable
								key={item.id}
								draggableId={item.id}
								index={index}
							>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										style={getItemStyle(
											snapshot.isDragging,
											provided.draggableProps.style
										)}
									>
										<Server
											key={index}
											id={item?.id ?? "" + Math.random()}
											monitors={monitors}
											value={item.val ?? {}}
											onChange={handleCardChange}
											removeItem={removeItem}
											dragHandleProps={provided.dragHandleProps}
										/>
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

ServersList.propTypes = {
	monitors: PropTypes.array.isRequired,
	cards: PropTypes.array.isRequired,
	setCards: PropTypes.function.isRequired,
	form: PropTypes.object.isRequired,
	setForm: PropTypes.function.isRequired,
    removeItem: PropTypes.function.isRequired
};

export default ServersList;
