initSidebarItems({"enum":[["Option","The `Option` type. See the module level documentation for more."],["Result","`Result` is a type that represents either success (`Ok`) or failure (`Err`).See the `std::result` module documentation for details."]],"fn":[["drop","Disposes of a value.While this does call the argument's implementation of `Drop`, it will not release any borrows, as borrows are based on lexical scope.This effectively does nothing for types which implement `Copy`, e.g. integers. Such values are copied and _then_ moved into the function, so the value persists after this function call.ExamplesBasic usage:Borrows are based on lexical scope, so this produces an error:An inner scope is needed to fix this:Since `RefCell` enforces the borrow rules at runtime, `drop()` can seemingly release a borrow of one:Integers and other types implementing `Copy` are unaffected by `drop()`"]],"struct":[["Box","A pointer type for heap allocation.See the module-level documentation for more."],["String","A UTF-8 encoded, growable string.The `String` type is the most common string type that has ownership over the contents of the string. It has a close relationship with its borrowed counterpart, the primitive `str`.ExamplesYou can create a `String` from a literal string with `String::from`:You can append a `char` to a `String` with the `push()` method, and append a `&str` with the `push_str()` method:If you have a vector of UTF-8 bytes, you can create a `String` from it with the `from_utf8()` method:UTF-8`String`s are always valid UTF-8. This has a few implications, the first of which is that if you need a non-UTF-8 string, consider `OsString`. It is similar, but without the UTF-8 constraint. The second implication is that you cannot index into a `String`:Indexing is intended to be a constant-time operation, but UTF-8 encoding does not allow us to do this. Furtheremore, it's not clear what sort of thing the index should return: a byte, a codepoint, or a grapheme cluster. The `as_bytes()` and `chars()` methods return iterators over the first two, respectively.Deref`String`s implement `Deref``<Target=str>`, and so inherit all of `str`'s methods. In addition, this means that you can pass a `String` to any function which takes a `&str` by using an ampersand (`&`):This will create a `&str` from the `String` and pass it in. This conversion is very inexpensive, and so generally, functions will accept `&str`s as arguments unless they need a `String` for some specific reason.RepresentationA `String` is made up of three components: a pointer to some bytes, a length, and a capacity. The pointer points to an internal buffer `String` uses to store its data. The length is the number of bytes currently stored in the buffer, and the capacity is the size of the buffer in bytes. As such, the length will always be less than or equal to the capacity.This buffer is always stored on the heap.You can look at these with the `as_ptr()`, `len()`, and `capacity()` methods:If a `String` has enough capacity, adding elements to it will not re-allocate. For example, consider this program:This will output the following:At first, we have no memory allocated at all, but as we append to the string, it increases its capacity appropriately. If we instead use the `with_capacity()` method to allocate the correct capacity initially:We end up with a different output:Here, there's no need to allocate more memory inside the loop."],["Vec","A contiguous growable array type, written `Vec<T>` but pronounced 'vector.'ExamplesThe `vec!` macro is provided to make initialization more convenient:It can also initialize each element of a `Vec<T>` with a given value:Use a `Vec<T>` as an efficient stack:Capacity and reallocationThe capacity of a vector is the amount of space allocated for any future elements that will be added onto the vector. This is not to be confused with the *length* of a vector, which specifies the number of actual elements within the vector. If a vector's length exceeds its capacity, its capacity will automatically be increased, but its elements will have to be reallocated.For example, a vector with capacity 10 and length 0 would be an empty vector with space for 10 more elements. Pushing 10 or fewer elements onto the vector will not change its capacity or cause reallocation to occur. However, if the vector's length is increased to 11, it will have to reallocate, which can be slow. For this reason, it is recommended to use `Vec::with_capacity` whenever possible to specify how big the vector is expected to get.GuaranteesDue to its incredibly fundamental nature, Vec makes a lot of guarantees about its design. This ensures that it's as low-overhead as possible in the general case, and can be correctly manipulated in primitive ways by unsafe code. Note that these guarantees refer to an unqualified `Vec<T>`. If additional type parameters are added (e.g. to support custom allocators), overriding their defaults may change the behavior.Most fundamentally, Vec is and always will be a (pointer, capacity, length) triplet. No more, no less. The order of these fields is completely unspecified, and you should use the appropriate methods to modify these. The pointer will never be null, so this type is null-pointer-optimized.However, the pointer may not actually point to allocated memory. In particular, if you construct a Vec with capacity 0 via `Vec::new()`, `vec![]`, `Vec::with_capacity(0)`, or by calling `shrink_to_fit()` on an empty Vec, it will not allocate memory. Similarly, if you store zero-sized types inside a Vec, it will not allocate space for them. *Note that in this case the Vec may not report a `capacity()` of 0*. Vec will allocate if and only if `mem::size_of::<T>() * capacity() > 0`. In general, Vec's allocation details are subtle enough that it is strongly recommended that you only free memory allocated by a Vec by creating a new Vec and dropping it.If a Vec *has* allocated memory, then the memory it points to is on the heap (as defined by the allocator Rust is configured to use by default), and its pointer points to `len()` initialized elements in order (what you would see if you coerced it to a slice), followed by `capacity() - len()` logically uninitialized elements.Vec will never perform a \"small optimization\" where elements are actually stored on the stack for two reasons:It would make it more difficult for unsafe code to correctly manipulate a Vec. The contents of a Vec wouldn't have a stable address if it were only moved, and it would be more difficult to determine if a Vec had actually allocated memory.It would penalize the general case, incurring an additional branch on every access.Vec will never automatically shrink itself, even if completely empty. This ensures no unnecessary allocations or deallocations occur. Emptying a Vec and then filling it back up to the same `len()` should incur no calls to the allocator. If you wish to free up unused memory, use `shrink_to_fit`.`push` and `insert` will never (re)allocate if the reported capacity is sufficient. `push` and `insert` *will* (re)allocate if `len() == capacity()`. That is, the reported capacity is completely accurate, and can be relied on. It can even be used to manually free the memory allocated by a Vec if desired. Bulk insertion methods *may* reallocate, even when not necessary.Vec does not guarantee any particular growth strategy when reallocating when full, nor when `reserve` is called. The current strategy is basic and it may prove desirable to use a non-constant growth factor. Whatever strategy is used will of course guarantee `O(1)` amortized `push`.`vec![x; n]`, `vec![a, b, c, d]`, and `Vec::with_capacity(n)`, will all produce a Vec with exactly the requested capacity. If `len() == capacity()`, (as is the case for the `vec!` macro), then a `Vec<T>` can be converted to and from a `Box<[T]>` without reallocating or moving the elements.Vec will not specifically overwrite any data that is removed from it, but also won't specifically preserve it. Its uninitialized memory is scratch space that it may use however it wants. It will generally just do whatever is most efficient or otherwise easy to implement. Do not rely on removed data to be erased for security purposes. Even if you drop a Vec, its buffer may simply be reused by another Vec. Even if you zero a Vec's memory first, that may not actually happen because the optimizer does not consider this a side-effect that must be preserved.Vec does not currently guarantee the order in which elements are dropped (the order has changed in the past, and may change again)."]],"trait":[["AsMut","A cheap, mutable reference-to-mutable reference conversion.**Note: this trait must not fail**. If the conversion can fail, use a dedicated method which return an `Option<T>` or a `Result<T, E>`.Generic Impls`AsMut` auto-dereference if the inner type is a reference or a mutable reference (eg: `foo.as_ref()` will work the same if `foo` has type `&mut Foo` or `&&mut Foo`)"],["AsRef","A cheap, reference-to-reference conversion.`AsRef` is very similar to, but different than, `Borrow`. See the book for more.**Note: this trait must not fail**. If the conversion can fail, use a dedicated method which return an `Option<T>` or a `Result<T, E>`.ExamplesBoth `String` and `&str` implement `AsRef<str>`:Generic Impls`AsRef` auto-dereference if the inner type is a reference or a mutable reference (eg: `foo.as_ref()` will work the same if `foo` has type `&mut Foo` or `&&mut Foo`)"],["Clone","A common trait for cloning an object.This trait can be used with `#[derive]`."],["Copy","Types that can be copied by simply copying bits (i.e. `memcpy`).By default, variable bindings have 'move semantics.' In other words:However, if a type implements `Copy`, it instead has 'copy semantics':It's important to note that in these two examples, the only difference is if you are allowed to access `x` after the assignment: a move is also a bitwise copy under the hood.When can my type be `Copy`?A type can implement `Copy` if all of its components implement `Copy`. For example, this `struct` can be `Copy`:A `struct` can be `Copy`, and `i32` is `Copy`, so therefore, `Point` is eligible to be `Copy`.The `PointList` `struct` cannot implement `Copy`, because `Vec<T>` is not `Copy`. If we attempt to derive a `Copy` implementation, we'll get an error:How can I implement `Copy`?There are two ways to implement `Copy` on your type:andThere is a small difference between the two: the `derive` strategy will also place a `Copy` bound on type parameters, which isn't always desired.When can my type _not_ be `Copy`?Some types can't be copied safely. For example, copying `&mut T` would create an aliased mutable reference, and copying `String` would result in two attempts to free the same buffer.Generalizing the latter case, any type implementing `Drop` can't be `Copy`, because it's managing some resource besides its own `size_of::<T>()` bytes.When should my type be `Copy`?Generally speaking, if your type _can_ implement `Copy`, it should. There's one important thing to consider though: if you think your type may _not_ be able to implement `Copy` in the future, then it might be prudent to not implement `Copy`. This is because removing `Copy` is a breaking change: that second example would fail to compile if we made `Foo` non-`Copy`.DerivableThis trait can be used with `#[derive]`."],["Default","A trait for giving a type a useful default value.A struct can derive default implementations of `Default` for basic types using `#[derive(Default)]`.Examples"],["DoubleEndedIterator","An iterator able to yield elements from both ends.Something that implements `DoubleEndedIterator` has one extra capability over something that implements `Iterator`: the ability to also take `Item`s from the back, as well as the front.It is important to note that both back and forth work on the same range, and do not cross: iteration is over when they meet in the middle.In a similar fashion to the `Iterator` protocol, once a `DoubleEndedIterator` returns `None` from a `next_back()`, calling it again may or may not ever return `Some` again. `next()` and `next_back()` are interchangable for this purpose.ExamplesBasic usage:"],["Drop","The `Drop` trait is used to run some code when a value goes out of scope. This is sometimes called a 'destructor'.ExamplesA trivial implementation of `Drop`. The `drop` method is called when `_x` goes out of scope, and therefore `main` prints `Dropping!`."],["Eq","Trait for equality comparisons which are equivalence relations.This means, that in addition to `a == b` and `a != b` being strict inverses, the equality must be (for all `a`, `b` and `c`):reflexive: `a == a`; symmetric: `a == b` implies `b == a`; and transitive: `a == b` and `b == c` implies `a == c`. This property cannot be checked by the compiler, and therefore `Eq` implies `PartialEq`, and has no extra methods.This trait can be used with `#[derive]`."],["ExactSizeIterator","An iterator that knows its exact length.Many `Iterator`s don't know how many times they will iterate, but some do. If an iterator knows how many times it can iterate, providing access to that information can be useful. For example, if you want to iterate backwards, a good start is to know where the end is.When implementing an `ExactSizeIterator`, You must also implement `Iterator`. When doing so, the implementation of `size_hint()` *must* return the exact size of the iterator.The `len()` method has a default implementation, so you usually shouldn't implement it. However, you may be able to provide a more performant implementation than the default, so overriding it in this case makes sense.ExamplesBasic usage:In the module level docs, we implemented an `Iterator`, `Counter`. Let's implement `ExactSizeIterator` for it as well:"],["Extend","Extend a collection with the contents of an iterator.Iterators produce a series of values, and collections can also be thought of as a series of values. The `Extend` trait bridges this gap, allowing you to extend a collection by including the contents of that iterator.ExamplesBasic usage:Implementing `Extend`:"],["Fn","A version of the call operator that takes an immutable receiver."],["FnMut","A version of the call operator that takes a mutable receiver."],["FnOnce","A version of the call operator that takes a by-value receiver."],["From","Construct `Self` via a conversion.**Note: this trait must not fail**. If the conversion can fail, use a dedicated method which return an `Option<T>` or a `Result<T, E>`.Examples`String` implements `From<&str>`:Generic impls`From<T> for U` implies `Into<U> for T` `from()` is reflexive, which means that `From<T> for T` is implemented"],["Into","A conversion that consumes `self`, which may or may not be expensive.**Note: this trait must not fail**. If the conversion can fail, use a dedicated method which return an `Option<T>` or a `Result<T, E>`.Library writer should not implement directly this trait, but should prefer the implementation of the `From` trait, which offer greater flexibility and provide the equivalent `Into` implementation for free, thanks to a blanket implementation in the standard library.Examples`String` implements `Into<Vec<u8>>`:Generic Impls`From<T> for U` implies `Into<U> for T` `into()` is reflexive, which means that `Into<T> for T` is implemented"],["IntoIterator","Conversion into an `Iterator`.By implementing `IntoIterator` for a type, you define how it will be converted to an iterator. This is common for types which describe a collection of some kind.One benefit of implementing `IntoIterator` is that your type will work with Rust's `for` loop syntax.See also: `FromIterator`.ExamplesBasic usage:Implementing `IntoIterator` for your type:"],["Iterator","An interface for dealing with iterators.This is the main iterator trait. For more about the concept of iterators generally, please see the module-level documentation. In particular, you may want to know how to implement `Iterator`."],["Ord","Trait for types that form a total order.An order is a total order if it is (for all `a`, `b` and `c`):total and antisymmetric: exactly one of `a < b`, `a == b` or `a > b` is true; and transitive, `a < b` and `b < c` implies `a < c`. The same must hold for both `==` and `>`. This trait can be used with `#[derive]`. When `derive`d, it will produce a lexicographic ordering based on the top-to-bottom declaration order of the struct's members."],["PartialEq","Trait for equality comparisons which are partial equivalence relations.This trait allows for partial equality, for types that do not have a full equivalence relation.  For example, in floating point numbers `NaN != NaN`, so floating point types implement `PartialEq` but not `Eq`.Formally, the equality must be (for all `a`, `b` and `c`):symmetric: `a == b` implies `b == a`; and transitive: `a == b` and `b == c` implies `a == c`. Note that these requirements mean that the trait itself must be implemented symmetrically and transitively: if `T: PartialEq<U>` and `U: PartialEq<V>` then `U: PartialEq<T>` and `T: PartialEq<V>`.PartialEq only requires the `eq` method to be implemented; `ne` is defined in terms of it by default. Any manual implementation of `ne` *must* respect the rule that `eq` is a strict inverse of `ne`; that is, `!(a == b)` if and only if `a != b`.This trait can be used with `#[derive]`."],["PartialOrd","Trait for values that can be compared for a sort-order.The comparison must satisfy, for all `a`, `b` and `c`:antisymmetry: if `a < b` then `!(a > b)`, as well as `a > b` implying `!(a < b)`; and transitivity: `a < b` and `b < c` implies `a < c`. The same must hold for both `==` and `>`. Note that these requirements mean that the trait itself must be implemented symmetrically and transitively: if `T: PartialOrd<U>` and `U: PartialOrd<V>` then `U: PartialOrd<T>` and `T: PartialOrd<V>`.PartialOrd only requires implementation of the `partial_cmp` method, with the others generated from default implementations.However it remains possible to implement the others separately for types which do not have a total order. For example, for floating point numbers, `NaN < 0 == false` and `NaN >= 0 == false` (cf. IEEE 754-2008 section 5.11).This trait can be used with `#[derive]`. When `derive`d, it will produce an ordering based on the top-to-bottom declaration order of the struct's members."],["Send","Types that can be transferred across thread boundaries.This trait is automatically derived when the compiler determines it's appropriate."],["Sized","Types with a constant size known at compile-time.All type parameters which can be bounded have an implicit bound of `Sized`. The special syntax `?Sized` can be used to remove this bound if it is not appropriate."],["SliceConcatExt","An extension trait for concatenating slices"],["Sync","Types that can be safely shared between threads when aliased.The precise definition is: a type `T` is `Sync` if `&T` is thread-safe. In other words, there is no possibility of data races when passing `&T` references between threads.As one would expect, primitive types like `u8` and `f64` are all `Sync`, and so are simple aggregate types containing them (like tuples, structs and enums). More instances of basic `Sync` types include \"immutable\" types like `&T` and those with simple inherited mutability, such as `Box<T>`, `Vec<T>` and most other collection types. (Generic parameters need to be `Sync` for their container to be `Sync`.)A somewhat surprising consequence of the definition is `&mut T` is `Sync` (if `T` is `Sync`) even though it seems that it might provide unsynchronized mutation. The trick is a mutable reference stored in an aliasable reference (that is, `& &mut T`) becomes read-only, as if it were a `& &T`, hence there is no risk of a data race.Types that are not `Sync` are those that have \"interior mutability\" in a non-thread-safe way, such as `Cell` and `RefCell` in `std::cell`. These types allow for mutation of their contents even when in an immutable, aliasable slot, e.g. the contents of `&Cell<T>` can be `.set`, and do not ensure data races are impossible, hence they cannot be `Sync`. A higher level example of a non-`Sync` type is the reference counted pointer `std::rc::Rc`, because any reference `&Rc<T>` can clone a new reference, which modifies the reference counts in a non-atomic way.For cases when one does need thread-safe interior mutability, types like the atomics in `std::sync` and `Mutex` & `RWLock` in the `sync` crate do ensure that any mutation cannot cause data races.  Hence these types are `Sync`.Any types with interior mutability must also use the `std::cell::UnsafeCell` wrapper around the value(s) which can be mutated when behind a `&` reference; not doing this is undefined behavior (for example, `transmute`-ing from `&T` to `&mut T` is invalid).This trait is automatically derived when the compiler determines it's appropriate."],["ToOwned","A generalization of `Clone` to borrowed data.Some types make it possible to go from borrowed to owned, usually by implementing the `Clone` trait. But `Clone` works only for going from `&T` to `T`. The `ToOwned` trait generalizes `Clone` to construct owned data from any borrow of a given type."],["ToString","A trait for converting a value to a `String`.This trait is automatically implemented for any type which implements the `Display` trait. As such, `ToString` shouldn't be implemented directly: `Display` should be implemented instead, and you get the `ToString` implementation for free."]]});