/**
 * Following class is used as a node for priority quote
 * 
 * @author David Omrai
 */
class PriorityNode {
    constructor(priority, value, reference) {
        // Element priority
        this.priority = priority
        // Element value
        this.value = value
        // Element reference
        this.reference = reference
    }
    setValue(newValue) {
      this.value = newValue
    }
    setPriority(newPriority) {
      this.priority = newPriority
    }
    getValue() {
      return this.value
    }
    getPriority() {
      return this.priority
    }
    getReference() {
      return this.reference
    }
}

/**
 * Class represents a priority queue.
 * 
 * Implemented David Omrai
 */
class PriorityQueue {
  constructor() {
    // Array represents priority queue
    this.queue = new Array()
    /**
     * Number of the same priorities inside queue
     * { priority: number_of_same_priorities }
     */
    this.prioritiesNum = new Object()
    // Total number of processed elements
    this.processedElements = 0
    /**
     * Object holds information about reference index.
     * { reference: element_index, ... }  
     */
    this.referencesIndexes = new Object()
  }

  /**
   * Method increases the number of given references.
   * @param priority Priority of an element. 
   */
  increasePriorityNums(priority) {
    if (priority in this.prioritiesNum) {
      this.prioritiesNum[priority] += 1
    } else {
      this.prioritiesNum[priority] = 1
    }
  }

  /**
   * Method decreases the number of given priorities in queue.
   * @param priority Priority of an element. 
   */
  decreasePriorityNums(priority) {
    if ((priority in this.prioritiesNum)
        && this.prioritiesNum[priority] != 0) {
      this.prioritiesNum[priority] -= 1
    }

    if (this.prioritiesNum[priority] <= 0) {
      delete this.prioritiesNum[priority]
    }
  }

  /**
   * Method dequeue element on given index and returns it.
   * @param index Index of element to dequeue 
   * @returns Dequeued element.
   */
  dequeueElement(index) {
    if (index < this.queue.length && index >= 0) {
      // Remove element from queue
      const removedElement = this.queue.splice(index, 1)

      // Update references indexes
      for (let i = index; i < this.queue.length; i++) {
        const element = this.queue[i]
        this.referencesIndexes[element.getReference()] = i
      }
      
      // Return removed element
      return removedElement[0]
    }
  }

  /**
   * Method queues element to specific place inside queue.
   * @param index Index of element to dequeue.
   */
   queueElement(index, element) {
    if (this.queue.length >= index) {
      this.queue.splice(index, 0, element)

      // Update the stored indexes of elements
      for (let i = index; i < this.queue.length; i++) {
        const element = this.queue[i]
        this.referencesIndexes[element.getReference()] = i
      }
    }
  }

  /**
   * Mehtod finds index for element.
   * @param priority Given element priority.
   * @returns Index for new element. 
   */
  findIndexForElement(priority) {
    let i = 0
    for (i = 0; i < this.queue.length; i++) {
      if (this.queue[i].getPriority() < priority) {
        return i
      }
    }
    return i
  }

  /**
   * ** 1b **
   * Push a new element in the queue with specified priority (higher priority comes out first).
   * When two inserted elements have the same priority, FIFO applies.
   * @param element {any}
   * @param priority {Number} can by any Number (even negative, float...).
   * @return {any} unique identifier of this element in the queue, used in other methods to reference this element
   * @throws {TypeError} when priority is not a Number
   */
  add(element, priority) {
    if (typeof priority !== 'number') {
      throw 'TypeError'
    }
    // Increase the number of processed elements
    this.processedElements += 1

    // Create a new queue node
    let node = new PriorityNode(priority, element, this.processedElements)

    // Increase the number of elements with the same priority
    this.increasePriorityNums(priority)

    // Find position in queue for element
    let elementIndex = this.findIndexForElement(priority)

    // Place element to queue
    this.queueElement(elementIndex, node)

    // Connect reference with element index, for faster search of element
    this.referencesIndexes[this.processedElements] = elementIndex

    // Return an element reference
    return this.processedElements
  }

  /**
   * ** 0.5b **
   * Return the next prioritized element, but keep it in the queue
   * @return {any} queue element at the first position
   */
  get front() {
    if (this.queue.length === 0) {
      throw 'Empty priority queue'
    }
    return this.queue[0].getValue()
  }

  /**
   * ** 0.5b **
   * Return the next prioritized element and dequeue it from the queue
   * @return {any} queue element at the first position
   */
  next() {
    if (this.queue.length === 0) {
      throw 'Empty priority queue'
    }
    // Remove element from queue
    let node = this.dequeueElement(0)

    // Update the stats
    this.decreasePriorityNums(node.getPriority())

    // Indicate the removal of reference
    this.referencesIndexes[node.getReference()] = -1

    // Return element value
    return node.getValue()
  }

  /**
   * ** 0.5b **
   * @return {Number} **current** queue length
   */
  get length() {
      return this.queue.length
  }

  /**
   * ** 0.5b **
   * @return {Number} total amount of elements which have **ever been enqueued** in the queue
   */
  get totalProcessed() {
      return this.processedElements
  }

  /**
   * ** 1b **
   * For given position in the queue, return object containing element's unique identifier
   *      (same identifier as previously returned from the `add` method) and also element's value
   * @param position {Number}
   * @return {?Object}
   * * {
   *     ref: {any}
   *     value: {any}
   * } when position contains an element
   * * `null` when position is higher than current queue length
   * @throws {TypeError} when `position` is not a Number
   * @throws {RangeError} when `position` is <= 0
   */
  at(position) {
    if (typeof position !== 'number') {
      throw 'TypeError'
    }
    if (position <= 0) {
      throw 'RangeError'
    }
    if (position >= this.queue.length) {
      return null
    }

    // Create output object
    const element = new Object()
    element.ref = this.queue[position - 1].getReference()
    element.value = this.queue[position - 1].getValue()

    return element
  }

  /**
   * ** 1b **
   * Get current position of referenced element in the queue.
   * @param elementRef {any} Identifier obtained from the `add` method
   * @return {Number}
   * * `1` = first in line
   * * `length of queue` = last in line
   * * `-1` = referenced element is no longer in the queue
   * @throws {ReferenceError} when given reference have never existed (invalid reference)
   */
  positionOf(elementRef) {
    if (typeof elementRef !== 'number' || elementRef > this.processedElements || elementRef <= 0) {
      throw 'ReferenceError'
    }

    // Get element index
    let elementIndex = this.referencesIndexes[elementRef]
    // Is element still inside queue?
    if (elementIndex === -1) {
      return -1
    }

    return elementIndex + 1
  }

  /**
   * ** 1b **
   * Change the priority of referenced element
   * @param elementRef {any} Identifier obtained from the `add` method
   * @param newPriority {Number}
   * @return {Number}
   * * <1, Inf] = new position in the queue
   * * -1 = referenced element is no longer in the queue
   * @throws {ReferenceError} when given reference have never existed (invalid reference)
   * @throws {TypeError} when `newPriority` is not a Number
   */
  changePriority(elementRef, newPriority) {
    if (typeof elementRef !== 'number' || elementRef > this.processedElements || elementRef <= 0) {
      throw 'ReferenceError'
    }
    if (typeof newPriority !== 'number') {
      throw 'TypeError'
    }

    // Find the position of element
    let elementPos = this.positionOf(elementRef)
    if (elementPos === -1) {
      return -1
    }

    // Change position to index
    let elementIndex = elementPos - 1

    // Remove element from queue
    const element = this.dequeueElement(elementIndex)

    // Update removed priority
    this.decreasePriorityNums(element.getPriority())

    // Find new place for element
    let newIndex = this.findIndexForElement(newPriority)

    // Update element
    element.setPriority(newPriority)

    // Add updated element
    this.queueElement(newIndex, element)

    // Update reference position
    this.referencesIndexes[elementRef] = newIndex

    // Update priority
    this.increasePriorityNums(newPriority)

    // Return new position
    return newIndex + 1
  }

  /**
   * ** 1b **
   * Remove referenced element from the queue, shifting elements at higher positions forward
   * @param elementRef
   * @return {Boolean}
   * * true when referenced element was present in the queue, and thus has been removed
   * * false when referenced  element has already been removed from the queue earlier (either by `removeByRef` or `next` method)
   * @throws {ReferenceError} when given reference have never existed (invalid reference)
   */
  removeByRef(elementRef) {
    if (typeof elementRef !== 'number' || elementRef > this.processedElements || elementRef <= 0) {
      throw 'ReferenceError'
    }

    // Find the position of element
    let elementPos = this.positionOf(elementRef)

    // Is element still in queue?
    if (elementPos === -1) {
      return false
    }

    // Change position to index
    let elementIndex = elementPos - 1

    // Remove element from queue
    let element = this.dequeueElement(elementIndex)

    // Update removed priority
    this.decreasePriorityNums(element.getPriority())

    // Indicate the reference removal
    this.referencesIndexes[element.getReference()] = -1

    return true
  }

  /**
   * ** 1b **
   * Remove element at given position, shifting elements at higher positions forward
   * @return {Boolean}
   * * true when position was occupied and so the element has been removed
   * * false when position is higher than current queue length
   * @param position
   * @throws {TypeError} when `position` is not a Number
   * @throws {RangeError} when `position` is <= 0
   */
  removeByPosition(position) {
    if (typeof position !== 'number') {
      throw 'TypeError'
    }
    if (position <= 0) {
      throw 'RangeError'
    }

    // Is position correct?
    if (position > this.queue.length) {
      return false
    }

    // Change position to index
    let elementIndex = position - 1

    // Remove element from queue
    let element = this.dequeueElement(elementIndex)

    // Update removed priority
    this.decreasePriorityNums(element.getPriority())

    // Indicate the reference removal
    this.referencesIndexes[element.getReference()] = -1

    return true
  }

  /**
   * ** 0.5b **
   * Remove all elements from the queue
   */
  clear() {
    for (const element of this.queue) {
      this.decreasePriorityNums(element.getPriority())
      this.referencesIndexes[element.getReference()] = -1
    }
    // Set queue size to zero
    this.queue.length = 0
  }

  /**
   * ** 1.5b **
   * Similar to the Array.prototype.forEach, but iterate elements in prioritized queue order and instead of index,
   *      return their position. Does not return overall array of remaining elements
   * @param callbackfn {Function} A function that accepts up to two arguments: (value, position)
   * @param thisArg {Object} An object to which the `this` keyword can refer in the callbackfn function.
   *      If thisArg is omitted, undefined is used as the `this` value.
   * @throws {TypeError} when `callbackfn` is not a Function
   */
  forEach(callbackfn, thisArg= undefined) {
    if (typeof callbackfn !== 'function') {
      throw 'TypeError'
    }
    
    const bindedcallbackfn = callbackfn.bind(thisArg)

    for (let i = 0; i < this.queue.length; i++) {
      const element = this.queue[i]
      let value = element.getValue()
      let position = this.referencesIndexes[element.getReference()]

      bindedcallbackfn(value, position)
    }
  }

  /**
   * ** 1b **
   * Provide statistics of current queue usage: return Object of **currently** used priorities and amount of items with each priority
   * @return {Object}
   * {
   *     priority: amount_of_elements_with_this_priority,
   *     another_priority: amount_of_elements_with_this_priority
   * }
   */
  get stats() {
      return this.prioritiesNum
  }
}


// Some example elements to be added in the priority queue
const el1 = 'I came here first!'
const el2 = 'But I have higher priority!'
const fnEl = () => 'I am function returning a string!'
const objEl = {
    a: 2,
    b: 1
}
const numEl = 7


/*
PriorityQueue example usage (covering only these this does not guarantee 100% points earned, refer to comments above
each method to cover all edge cases, return values and throw types.
 */
const pq = new PriorityQueue

console.assert(pq.length === 0, `pq.length === 0`)
const el1Ref = pq.add(el1, 1)
console.assert(pq.length === 1, `pq.length === 1`)

const el2Ref = pq.add(el2, 2)
console.assert(pq.front === el2, `pq.front === ${el2}`)
console.assert(pq.stats[2] === 1, `pq.stats[2] === 1`)

console.assert(pq.changePriority(el1Ref, 3) === 1, `pq.changePriority(el1Ref, 3) === 1`)
console.assert(pq.front === el1, `pq.front === ${el1}`)
console.assert(pq.next() === el1, `pq.next() === ${el1}`)
console.assert(pq.length === 1, `pq.length === 1`)

const fnElRef = pq.add(fnEl, 7)
const objElRef1 = pq.add(objEl, -12.123456789)
const objElRef2 = pq.add(objEl, -12.123456789)
const objElRef3 = pq.add(objEl, -12.123456789)

console.assert(pq.at(2).ref === el2Ref, `pq.at(2).ref === ${el2Ref}`)
console.assert(pq.at(2).value === el2, `pq.at(2).value === ${el2}`)
console.assert(pq.at(17) === null, `pq.at(17) === null`)
console.assert(pq.positionOf(objElRef3) === 5, `pq.positionOf(objElRef3) === 5`)
console.assert(pq.removeByRef(objElRef2) === true, `pq.removeByRef(objElRef2) === true`)
console.assert(pq.positionOf(objElRef3) === 4, `pq.positionOf(objElRef3) === 4`)
console.assert(pq.totalProcessed === 6, `pq.totalProcessed === 6`)
console.assert(pq.length === 4, `pq.length === 4`)
console.assert(pq.removeByPosition(4) === true, `pq.removeByPosition(4) === true`)
console.assert(pq.removeByPosition(4) === false, `pq.removeByPosition(4) === false`)
objEl.c = 'some new property'
console.assert(pq.changePriority(objElRef1, 999) === 1, `pq.changePriority(objElRef3, 999) === 1`)
console.assert(pq.front.c === 'some new property', `pq.front().c === 'some new property'`)

pq.forEach((value, position) => {
    console.log([position, value])
}) // Should write out three items: object, function, string

pq.clear()
console.assert(pq.length === 0, `pq.length === 0`)
console.assert(pq.totalProcessed === 6, `pq.totalProcessed === 6`)
