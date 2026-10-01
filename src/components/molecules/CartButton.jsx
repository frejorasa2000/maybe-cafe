import { useDispatch, useSelector } from 'react-redux';
import { openCart, selectCartCount } from '../../features/cart/cartSlice';
import { CartIcon } from '../atoms/icons/UiIcons';

export default function CartButton({ light = false }) {
  const dispatch = useDispatch();
  const count = useSelector(selectCartCount);

  return (
    <button
      type="button"
      data-cursor-hover
      onClick={() => dispatch(openCart())}
      aria-label="Open cart"
      className={`relative ${light ? 'text-[#f3ecdf]' : 'text-espresso'}`}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-ink">
          {count}
        </span>
      )}
    </button>
  );
}
