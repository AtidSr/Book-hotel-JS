const { constants } = require('buffer')
const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

class Customer {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  getName() {
    return this.name
  }

  getAge() {
    return this.getAge
  }
}

class Booked {

  constructor(Customer, booked_room, floor) {
    this.customer_info = Customer
    this.booked_room = booked_room
    this.keycard = -1
  }

  setKeyCard(key) {
    this.keycard = key
  } 

}

const generateRoom = (floor, roomPerFloor) => {
  let roomList = []

  for (let index = 0; index < floor; index++) {
    for (let jIndex = 0; jIndex < roomPerFloor; jIndex++) {
      if(jIndex < 10) {
        roomList.push(`${index+1}0${jIndex+1}`)
      } else {
        roomList.push(`${index+1}${jIndex+1}`)
      }
    }
  }
  return roomList
}

const generateKey = (roomList) => {
  let key = []
  roomList.map((item,index) => key.push(index+1))
  return key
}

const removeItem = (array, item) => {
  let list = array
  let index = list.indexOf(item);

  if (index !== -1) {
    list.splice(index, 1);
  }
  return list
}

function main() {
  const filename = 'input.txt'
  const commands = getCommandsFromFileName(filename)
  const note = []
  let hotel = {}
  let availableRoom = []
  let availableKey = []

  commands.forEach(command => {

    switch (command.name) {
      case 'create_hotel':
        const [floor, roomPerFloor] = command.params
        hotel = { floor, roomPerFloor }
        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        availableRoom = generateRoom(floor, roomPerFloor).map(x => +x)
        availableKey = generateKey(availableRoom)
        return
      case 'book':
        const booked_detail = new Booked(new Customer(command.params[1], command.params[2]), command.params[0])

        
          if(availableKey.length > 0){
            if(note.some(detail => detail.booked_room === booked_detail.booked_room)) {
              let roomOwner =  note.filter(detail => detail.booked_room === booked_detail.booked_room)[0].customer_info.name
              console.log(`Cannot book room ${booked_detail.booked_room} for ${booked_detail.customer_info.name}, The room is currently booked by ${roomOwner}.`)
            }else {
              booked_detail.setKeyCard(availableKey.shift())
              note.push(booked_detail)
              removeItem(availableRoom, booked_detail.booked_room)
              console.log(`Room ${booked_detail.booked_room} is booked by ${booked_detail.customer_info.name} with keycard number ${booked_detail.keycard}.`)
            }
          }
        
        return
        case 'list_available_rooms':
          console.log(availableRoom.toString())
          return
        case 'checkout':
          let owner = note.filter(item => item.keycard === command.params[0])[0]
          if(owner.customer_info.name === command.params[1] && owner.keycard === command.params[0]) {
            let x = note.splice(note.findIndex(item => item.keycard === command.params[0]), 1)
            availableKey.push(command.params[0])
            availableKey.sort()
            availableRoom.push(x[0].booked_room)
            availableRoom.sort()
            console.log(`Room ${x[0].booked_room} is checkout.`)
          } else {
            console.log(`Only ${owner.customer_info.name} can checkout with keycard number ${owner.keycard}.`)
          }
          return
          case 'list_guest':
            let guest_list = []
            note.map(customer => guest_list.push(customer.customer_info.name))
            console.log(guest_list.toString().replace(/,/g,', '))
          return
          case 'get_guest_in_room':
            let guest_in_room = note.filter(customer => customer.booked_room === command.params[0])
            console.log(guest_in_room[0].customer_info.name)
          return
          case 'list_guest_by_age':
            let list_guest = []
            note.map(customer => {if(customer.customer_info.age < 18){list_guest.push(customer.customer_info.name)}})
            console.log(list_guest.toString().replace(/,/g,', '))
          return
          case 'list_guest_by_floor':
            let list_guest_by_floor = []
            note.map(customer => {if(Math.floor(customer.booked_room/100) === command.params[0]){list_guest_by_floor.push(customer.customer_info.name)}})
            console.log(list_guest_by_floor.toString().replace(/,/g,', '))
          return
          case 'checkout_guest_by_floor':
            let checkout_list = note.filter(customer => Math.floor(customer.booked_room/100) === command.params[0])
            let checkout_room = []
            checkout_list.map(list => {
              let x = note.splice(note.findIndex(item => item.keycard === list.keycard), 1)
              availableKey.push(list.keycard)
              availableKey.sort()
              availableRoom.push(x[0].booked_room)
              availableRoom.sort()
              checkout_room.push(x[0].booked_room)
            })
            console.log(`Room ${checkout_room.toString().replace(/,/g,', ')} is checkout.`)
          return
          case 'book_by_floor':
            let available =  availableRoom.filter(room => Math.floor(room/100) === command.params[0])
            let bookedRoom = []
            let usedKey = []

            if(available.length === hotel.roomPerFloor) {
              available.map(room => {
                let book_floor =  new Booked(new Customer(command.params[1], command.params[2]), room)
                book_floor.setKeyCard(availableKey.shift())
                removeItem(availableRoom, room)
                bookedRoom.push(room)
                usedKey.push(book_floor.keycard)
              })
              console.log(`Room ${bookedRoom.toString().replace(/,/g,', ')} are booked with keycard number ${usedKey.toString().replace(/,/g,', ')}`)
            } else {
              console.log(`Cannot book floor ${command.params[0]} for ${command.params[1]}.`)
            }
            return
      default:
        return
    }
  })
  // console.log(note)
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8')

  return file
    .split('\n')
    .map(line => line.split(' '))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map(param => {
            const parsedParam = parseInt(param, 10)

            return Number.isNaN(parsedParam) ? param : parsedParam
          })
        )
    )
}

main()
