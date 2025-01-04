import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import ItemTypes from "./ItemTypes";
import Card from "@mui/material/Card";
import Server from "./Server"
import { CardContent } from "@mui/material";

/**
 * CustomCard is a React Forward Ref component that 
 * passes properties to its wrapped component with
 * ref that carrys the drag and drop feature etc 
 */
const CustomCard = React.forwardRef((props, ref) => (
	<Card ref={ref}>
		<CardContent>
			<Server
				id={props.id}
				removeItem={props.removeCard}
				value={props.value}
				onChange={props.onChange}
        monitors={props.monitors}
			/>
		</CardContent>
	</Card>
));

/** 
 * @param {*} id The Id of the Server component
 * @param {*} index The index of the Card in its natural order of placement
 * @param {*} moveCard The function to actually move a card
 * @param {*} removeCard The function to remote the card
 * @param {*} onChange The Change handler function to handle when the server value is changed
 * used to update the server(monitor) lists
 * @param {*} monitors The server monitors options
 * @param {*} value the option label of the server/monitor, namely the monitor name field
 * @returns The Card component representing a singler server/monitor that is capable of being 
 * dragged and droped
 */

const MyCard = ({ id, index, moveCard, removeCard, value, onChange, monitors }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;     

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
            
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });
  const [ _, drag] = useDrag({
    type: ItemTypes.CARD,
    item: {id: id, index:index},
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });  
  drag(drop(ref));
	return (
		<CustomCard
			ref={ref}
			id={id}
			removeCard={removeCard}
			value={value}
			onChange={onChange}
      monitors={monitors}
		/>
	);
};

export default MyCard;


